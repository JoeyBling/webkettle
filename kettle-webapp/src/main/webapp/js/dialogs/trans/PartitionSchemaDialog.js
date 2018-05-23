PartitionSchemaDialog = Ext.extend(Ext.Window, {
	title: '数据库分区Schema对话框',
	width: 600,
	height: 400,
	modal: true,
	layout: 'border',
	iconCls: 'PartitionSchema',
	defaults: {border: false},
	initComponent: function() {
		var me = this;
		
		var wPartitionSchemas =  new ListView({
			region: 'west',
			width: 200,
			valueField: 'name',
			store: getActiveGraph().getPartitionSchemaStore(),
			columns: [{
				width: 1, dataIndex: 'name'
			}]
		});
		
		var wName = new Ext.form.TextField({fieldLabel: '分区Schema名称', anchor: '-10'});
		var wDynamic = new Ext.form.Checkbox({fieldLabel: 'Dynamically create the schema'});
		var wNumber = new Ext.form.NumberField({fieldLabel: 'Number of partitions per slave server?', anchor: '-10'});
		
		var store = new Ext.data.JsonStore({
			idProperty: 'partitionId',
			fields: ['partitionId']
		});
		
		var grid = new KettleEditorGrid({
			title: '分区',
			region: 'center',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '导入分区', scope: this, handler: function() {
						var partitionStore = getActiveGraph().getPartitionDatabaseStore();
						var dialog = new EnterSelectionDialog({
							title: '导入数据库分区',
							store: partitionStore
						});
						
						dialog.on('sure', function(v) {
							partitionStore.each(function(rec) {
								if(rec.get('name') == v) {
									store.loadData(rec.get('partitionInfo'));
								}
							});
						});
						
						dialog.show();
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '分区ID', dataIndex: 'partitionId', width: 150, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		var initDefault = function() {
			wName.setValue('');
			wDynamic.setValue(false);
			wNumber.setValue(undefined);
			
			store.loadData([]);
		};
		
		wPartitionSchemas.on('selectionchange', function() {
			if(wPartitionSchemas.getSelectedRecords().length > 0) {
				var rec = wPartitionSchemas.getSelectedRecords()[0];
				
				wName.setValue(rec.get('name'));
				wDynamic.setValue('Y' == rec.get('dynamic'));
				wNumber.setValue(rec.get('partitions_per_slave'));
				
				store.loadData(rec.get('partition'));
			} else {
				initDefault();
			}
		});
		
		var menu = new Ext.menu.Menu({
			items: [{
				text: '新增', scope: this, handler: initDefault
			}, {
				text: '移除', disabled: Ext.isEmpty(wPartitionSchemas.getValue()), handler: function() {
					getActiveGraph().onClusterSchemaDel(wPartitionSchemas.getValue());
				}
			}, '-', {
				text: 'Share', disabled: Ext.isEmpty(wPartitionSchemas.getValue())
			}]
		});
		
		wPartitionSchemas.on('contextmenu', function(v, index, node, e) {
			menu.showAt(e.getXY());
			e.preventDefault();
		});
		
		this.items = [wPartitionSchemas, {
			region: 'center',
			layout: 'border',
			defaults: {border: false},
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 120,
				labelWidth: 220,
				tbar: [{
					text: '保存', scope: this, handler: function() {
						if(Ext.isEmpty(wName.getValue())) {
							alert('名称不能为空');
							return;
						}
						
						getActiveGraph().onPartitionSchemaMerge({
							name: wName.getValue(),
							dynamic: wDynamic.getValue() ? "Y" : "N",
							partitions_per_slave: wNumber.getValue(),
							partition: store.toJson()
						});
					}
				}, {
					text: '关闭', scope: this, handler: function() {
						me.close();
					}
				}],
				items: [wName, wDynamic, wNumber ]
			}, grid]
		}];
		
		PartitionSchemaDialog.superclass.initComponent.call(this);
	}
});


SelectPartitionDialog = Ext.extend(Ext.Window, {
	title: '选择分区',
	width: 500,
	height: 300,
	modal: true,
	layout: 'border',
	iconCls: 'PartitionSchema',
	defaults: {border: false},
	
	initComponent: function() {
		
		var allPartitions = new ListBox({
			displayField: 'name',
			valueField: 'name',
			store: getActiveGraph().getPartitionSchemaStore()
		});
		
		var partitionMethod = new ListBox({
			displayField: 'desc',
			valueField: 'code',
			store: Ext.StoreMgr.get('partitionMethod')
		});
		
		var fieldName = new Ext.form.TextField({anchor: '-5'});
		
		this.initData = function(data) {
			partitionMethod.setValue(data.method);
			allPartitions.setValue(data.schema_name);
			fieldName.setValue(data.field_name);
		};
		
		this.getData = function() {
			var data = {};
			data.method = partitionMethod.getValue();
			data.schema_name = allPartitions.getValue();
			data.field_name = fieldName.getValue();
			
			return data;
		};
		
		var form = new Ext.form.FormPanel({
			region: 'east',
			title: '分区信息',
			disabled: true,
			width: 150,
			bodyStyle: 'padding: 5px',
			labelWidth: 1,
			items: [{
				xtype: 'label', text: '分区字段：', style: 'font-size: 12px; line-height: 28px; padding-left: 5px'
			}, fieldName]
		});
		
		this.items = [{
			region: 'west',
			width: 150,
			title: '所有分区',
			layout: 'fit',
			items: allPartitions
		}, {
			region: 'center',
			title: '分区方式',
			layout: 'fit',
			items: partitionMethod
		}, form];
		
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		},{
			text: '确定', scope: this, handler: function() {
				this.fireEvent('ok', this.getData());
				this.close();
			}
		}];
		
		partitionMethod.on('valueChange', function(v) {
			if(v == 'ModPartitioner' && !Ext.isEmpty(allPartitions.getValue())) {
				form.enable();
			} else {
				form.disable();
			}
		});
		
		SelectPartitionDialog.superclass.initComponent.call(this);
		
		this.addEvents('ok')
	}
});