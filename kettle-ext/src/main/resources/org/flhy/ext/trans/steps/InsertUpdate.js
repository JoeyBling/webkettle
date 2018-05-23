InsertUpdateDialog = Ext.extend(KettleTabDialog, {
	title: BaseMessages.getString(PKG, "InsertUpdateDialog.Shell.Title"),
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
		var wCommit = new Ext.form.TextField({ fieldLabel: BaseMessages.getString(PKG, "InsertUpdateDialog.CommitSize.Label"), anchor: '-10', value: cell.getAttribute('commit')});
		var wUpdateBypassed = new Ext.form.Checkbox({ fieldLabel: '不执行任何更新', checked: cell.getAttribute('update_bypassed') == 'Y' });
		
		var searchStore = new Ext.data.JsonStore({
			fields: ['keyLookup', 'keyCondition', 'keyStream1', 'keyStream2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['updateLookup', 'updateStream', 'update'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				update_bypassed: wUpdateBypassed.getValue() ? "Y" : "N",
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
					xtype: 'button', text: BaseMessages.getString(PKG, "InsertUpdateDialog.Browse.Button"), handler: function() {
						me.selectSchema(wConnection, wSchema);
					}
				}]
			},{
				fieldLabel: BaseMessages.getString(PKG, "InsertUpdateDialog.TargetTable.Label"),
				xtype: 'compositefield',
				anchor: '-10',
				items: [wTable, {
					xtype: 'button', text: BaseMessages.getString(PKG, "InsertUpdateDialog.Browse.Button"), handler: function() {
						me.selectTable(wConnection, wSchema, wTable);
					}
				}]
			}, wCommit, wUpdateBypassed]
		}, {
			title: '查询字段',
			xtype: 'editorgrid',
			region: 'center',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({ keyLookup: '', keyCondition: '=',  keyStream1: '', keyStream2: '' });
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
						searchStore.merge(store, [{name: 'keyLookup', field: 'name'}, {name: 'keyCondition', value: '='}, {name:'keyStream1', field: 'name'}, {name: 'keyStream2', value: ''}]);
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.TableField"), dataIndex: 'keyLookup', width: 100, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.Comparator"), dataIndex: 'keyCondition', width: 100, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.StreamField1"), dataIndex: 'keyStream1', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.StreamField2"), dataIndex: 'keyStream2', width: 100, editor: new Ext.form.ComboBox({
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
			title: BaseMessages.getString(PKG, "InsertUpdateDialog.UpdateFields.Label"),
			xtype: 'editorgrid',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({  updateLookup: '', updateStream: '',  update: 'N'  });
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
				text: BaseMessages.getString(PKG, "InsertUpdateDialog.GetAndUpdateFields.Label"), handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						updateStore.merge(store, [{name:'updateLookup', field: 'name'}, {name:'updateStream', field: 'name'}, {name: 'update', value: 'Y'}]);
					});
				}
			}, {
				text: BaseMessages.getString(PKG, "InsertUpdateDialog.EditMapping.Label")
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.TableField"), dataIndex: 'updateLookup', width: 100, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "InsertUpdateDialog.ColumnInfo.StreamField"), dataIndex: 'updateStream', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: '更新', dataIndex: 'update', width: 100, renderer: function(v)
				{
					if(v == 'N') 
						return '否'; 
					else if(v == 'Y') 
						return '是';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: updateStore
		}];
		
		InsertUpdateDialog.superclass.initComponent.call(this);
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

Ext.reg('InsertUpdate', InsertUpdateDialog);