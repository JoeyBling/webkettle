UpdateDialog = Ext.extend(KettleTabDialog, {
	title: '更新',
	width: 600,
	height: 450,
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
			name: 'connection',
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
		var wBatch = new Ext.form.Checkbox({ fieldLabel: '批量更新', checked: cell.getAttribute('use_batch') == 'Y' });
		var wSkipLookup = new Ext.form.Checkbox({ fieldLabel: '跳过查询', checked: cell.getAttribute('skip_lookup') == 'Y' });
		var wIgnore = new Ext.form.Checkbox({ fieldLabel: '忽略查询失败', checked: cell.getAttribute('error_ignored') == 'Y' });
		var wIgnoreFlagField = new Ext.form.TextField({ fieldLabel: '标志字段(key found)', anchor: '-10', value: cell.getAttribute('ignore_flag_field')});
		
		var searchStore = new Ext.data.JsonStore({
			fields: ['field', 'condition', 'name', 'name2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['name', 'rename'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				use_batch: wBatch.getValue() ? "Y" : "N",
				skip_lookup: wSkipLookup.getValue() ? "Y" : "N",
				error_ignored: wIgnore.getValue() ? "Y" : "N",
				ignore_flag_field: wIgnoreFlagField.getValue(),		
				searchFields: Ext.encode(searchStore.toJson()),
				updateFields: Ext.encode(updateStore.toJson())
			};
		};
		
		this.tabItems = [{
			title: '基本配置',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 150,
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
			}, wCommit, wBatch, wIgnore, wSkipLookup, wIgnoreFlagField]
		}, {
			title: '查询字段',
			xtype: 'editorgrid',
			region: 'center',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({  field: '', condition: '',  name: ''  });
	                grid.stopEditing();
	                grid.getStore().insert(0, rec);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段', handler: function(btn) {
					var sm = btn.findParentByType('editorgrid').getSelectionModel();
					if(sm.hasSelection()) {
						var row = sm.getSelectedCell()[0];
						searchStore.removeAt(row);
					}
				}
			}, {
				text: '获取字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						searchStore.merge(store, ['name', {name: 'condition', value: '='}, {name:'field', field: 'name'}]);
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'field', width: 100, editor: new Ext.form.ComboBox({
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
				header: '比较符', dataIndex: 'condition', width: 100, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: '=', text: '='},
			        	       {value: '<>', text: '<>'},
			        	       {value: '<', text: '<'},
			        	       {value: '<=', text: '<='},
			        	       {value: '>', text: '>'},
			        	       {value: '>=', text: '>='},
			        	       {value: 'LIKE', text: 'LIKE'},
			        	       {value: 'BETWEEN', text: 'BETWEEN'},
			        	       {value: 'IS NULL', text: 'IS NULL'},
			        	       {value: 'IS NOT NULL', text: 'IS NOT NULL'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '流里的字段1', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: '流里的字段2', dataIndex: 'name2', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			}],
			store: searchStore
		}, {
			title: '更新字段',
			xtype: 'editorgrid',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({  name: '', rename: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, rec);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段', handler: function(btn) {
					var sm = btn.findParentByType('editorgrid').getSelectionModel();
					if(sm.hasSelection()) {
						var row = sm.getSelectedCell()[0];
						searchStore.removeAt(row);
					}
				}
			}, {
				text: '获取更新字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						updateStore.merge(store, ['name', {name:'rename', field: 'name'}]);
					});
				}
			}, {
				text: '编辑映射'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
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
				header: '流字段', dataIndex: 'rename', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			}],
			store: updateStore
		}];
		
		UpdateDialog.superclass.initComponent.call(this);
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

Ext.reg('Update', UpdateDialog);