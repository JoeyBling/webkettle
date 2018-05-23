TableOutputDialog = Ext.extend(KettleTabDialog, {
	title: '表输出',
	width: 600,
	height: 420,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'remote',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        store: getActiveGraph().getDatabaseStoreAll(),
			value: cell.getAttribute('connection')
		});
		
		var onDatabaseCreate = function(dialog) {
			getActiveGraph().onDatabaseMerge(dialog.getValue());
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wSchema = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('schema')});
		var wTable = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('table')});
		var wCommit = new Ext.form.TextField({ fieldLabel: '提交记录数量', anchor: '-10', value: cell.getAttribute('commit')});
		var wTruncate = new Ext.form.Checkbox({ fieldLabel: '裁剪表', checked: cell.getAttribute('truncate') == 'Y' });
		var wIgnore = new Ext.form.Checkbox({ fieldLabel: '忽略插入错误', checked: cell.getAttribute('ignore_errors') == 'Y' });
		var wSpecifyFields = new Ext.form.Checkbox({ fieldLabel: '指定数据库字段' });
		
		var wUsePart = new Ext.form.Checkbox({ fieldLabel: '表分区数据'});
		var wPartField = new Ext.form.ComboBox({
			fieldLabel: '分区字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
			disabled: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label')),
			value: cell.getAttribute('partitioning_field')
		});
		var wPartMonthly = new Ext.form.Radio({ fieldLabel: '每个月分区数据', name: 'partitioning_pl', disabled: true, checked: cell.getAttribute('partitioning_monthly') == 'Y' });
		var wPartDaily = new Ext.form.Radio({ fieldLabel: '每天分区数据', name: 'partitioning_pl', disabled: true, checked: cell.getAttribute('partitioning_daily') == 'Y' });
		var wBatch = new Ext.form.Checkbox({ fieldLabel: '使用批量插入', checked: cell.getAttribute('use_batch') == 'Y' });
		var wNameInField = new Ext.form.Checkbox({ fieldLabel: '表名定义在一个字段里' });
		var wNameField = new Ext.form.ComboBox({
			fieldLabel: '包含表名的字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        disabled: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label')),
			value: cell.getAttribute('tablename_field')
		});
		var wNameInTable = new Ext.form.Checkbox({ fieldLabel: '存储表名字段', checked: cell.getAttribute('tablename_in_table') == 'Y' });
		var wReturnKeys = new Ext.form.Checkbox({ fieldLabel: '返回一个自动产生的关键字', checked: cell.getAttribute('return_keys') == 'Y' });
		var wReturnField = new Ext.form.TextField({ fieldLabel: '自动产生的关键字的字段名称', anchor: '-10', value: cell.getAttribute('return_field')});
		
		var fieldStore = new Ext.data.JsonStore({
			fields: ['column_name', 'stream_name'],
			data: Ext.decode(cell.getAttribute('fields'))
		});
		
		wSpecifyFields.on('check', function(cb, checked) {
			var grid = me.findByType('editorgrid')[0];
			if(checked) grid.enable();
			else grid.disable();
		});
		wUsePart.on('check', function(cb, checked) {
			if(checked) {
				wPartField.enable();
				wPartMonthly.enable();
				wPartDaily.enable();
			} else {
				wPartField.disable();
				wPartMonthly.disable();
				wPartDaily.disable();
			}
		});
		wNameInField.on('check', function(cb, checked) {
			if(checked) wNameField.enable();
			else wNameField.disable();
		});
		
		this.on('afterrender', function() {
			wSpecifyFields.setValue(cell.getAttribute('specify_fields') == 'Y' );
			wUsePart.setValue(cell.getAttribute('partitioning_enabled') == 'Y' );
			wNameInField.setValue(cell.getAttribute('tablename_in_field') == 'Y' );
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				truncate: wTruncate.getValue() ? "Y" : "N",
				ignore_errors: wIgnore.getValue() ? "Y" : "N",
				specify_fields: wSpecifyFields.getValue() ? "Y" : "N",				
				partitioning_enabled: wUsePart.getValue() ? "Y" : "N",
				partitioning_field: wPartField.getValue(),	
				partitioning_monthly: wPartMonthly.getValue() ? "Y" : "N",				
				partitioning_daily: wPartDaily.getValue() ? "Y" : "N",		
				use_batch: wBatch.getValue() ? "Y" : "N",		
				tablename_in_field: wNameInField.getValue() ? "Y" : "N",
				tablename_field: wNameField.getValue(),	
				tablename_in_table: wNameInTable.getValue() ? "Y" : "N",		
				return_keys: wReturnKeys.getValue() ? "Y" : "N",
				return_field: wReturnField.getValue(),	
				fields: Ext.encode(fieldStore.toJson())
			};
		};
		
		this.tabItems = [{
			title: '基本配置',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 0px',
			items: [{
				xtype: 'compositefield',
				fieldLabel: '数据库连接',
				anchor: '-10',
				items: [wConnection, {
					xtype: 'button', text: '编辑...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initTransDatabase(wConnection.getValue());
						});
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initTransDatabase(null);
						});
					}
				}, {
					xtype: 'button', text: '向导...'
				}]
			},{
				fieldLabel: '目的模式',
				xtype: 'compositefield',
				anchor: '-10',
				items: [wSchema, {
					xtype: 'button', text: '浏览...', handler: function() {
						me.selectSchema(wConnection, wSchema);
					}
				}]
			},{
				fieldLabel: '目标表',
				xtype: 'compositefield',
				anchor: '-10',
				items: [wTable, {
					xtype: 'button', text: '浏览...', handler: function() {
						me.selectTable(wConnection, wSchema, wTable);
					}
				}]
			}, wCommit, wTruncate, wIgnore, wSpecifyFields]
		}, {
			title: '主选项',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 200,
			items: [wUsePart, wPartField, wPartMonthly, wPartDaily, wBatch, wNameInField, wNameField, wNameInTable, wReturnKeys, wReturnField]
		}, {
			title: '数据库字段',
			xtype: 'editorgrid',
			disabled: true,
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'column_name', width: 200, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().tableFields(wConnection.getValue(), wSchema.getValue(), wTable.getValue()),
					listeners : {
					     beforequery: function(qe){
					    	 delete qe.combo.lastQuery;
					     }
					} 
				})
			},{
				header: '流字段', dataIndex: 'stream_name', width: 200, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			}],
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({  column_name: '', stream_name: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, rec);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段', handler: function(btn) {
					var sm = btn.findParentByType('editorgrid').getSelectionModel();
					if(sm.hasSelection()) {
						var row = sm.getSelectedCell()[0];
						fieldStore.removeAt(row);
					}
				}
			},{
				text: '获取字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						fieldStore.merge(store, [{name: 'column_name', field: 'name'}, {name:'stream_name', field: 'name'}]);
					});
				}
			},{
				text: '输入字段映射', handler: function() {
					
				}
			}],
			store: fieldStore
		}];
		
		TableOutputDialog.superclass.initComponent.call(this);
	},
	
	selectSchema: function(wConnection, wSchema) {
		/*var store = getActiveGraph().getDatabaseStore();
		store.each(function(item) {
			if(item.get('name') == wConnection.getValue()) {
				var dialog = new DatabaseExplorerDialog({includeElement: 1});
				dialog.on('select', function(schema) {
					wSchema.setValue(schema);
					dialog.close();
				});
				dialog.show(null, function() {
					dialog.initDatabase(item.json);
				});
				return false;
			}
		});*/
		var dialog = new DatabaseExplorerDialog({includeElement: 1});
		dialog.on('select', function(schema) {
			wSchema.setValue(schema);
			dialog.close();
		});
		dialog.show(null, function() {
			dialog.initDatabase(wConnection.getValue());
		});
		return false;
	},
	
	selectTable: function(wConnection, wSchema, wTable) {
		/*var store = getActiveGraph().getDatabaseStore();
		store.each(function(item) {
			if(item.get('name') == wConnection.getValue()) {
				var dialog = new DatabaseExplorerDialog();
				dialog.on('select', function(table, schema) {
					wTable.setValue(table);
					wSchema.setValue(schema);
					dialog.close();
				});
				dialog.show(null, function() {
					dialog.initDatabase(item.json);
				});
				return false;
			}
		});*/
		var dialog = new DatabaseExplorerDialog();
		dialog.on('select', function(table, schema) {
			wTable.setValue(table);
			wSchema.setValue(schema);
			dialog.close();
		});
		dialog.show(null, function() {
			dialog.initDatabase(wConnection.getValue());
		});
		return false;
	}
});

Ext.reg('TableOutput', TableOutputDialog);