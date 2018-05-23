DeleteDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "DeleteDialog.Shell.Title"),
	width: 600,
	height: 500,
	
	initComponent: function() {
		var me = this;
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'remote',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        store: getActiveGraph().getDatabaseStoreAll()
		});
		
		var onDatabaseCreate = function(dialog) {
			getActiveGraph().onDatabaseMerge(dialog.getValue());
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wSchema = new Ext.form.TextField({flex: 1});
		var wTable = new Ext.form.TextField({flex: 1});
		var wCommit = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "DeleteDialog.Commit.Label"), anchor: '-10'});
		
		var searchStore = new Ext.data.JsonStore({
			idProperty: 'field',
			fields: ['field', 'condition', 'name', 'name2']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			DeleteDialog.superclass.initData.apply(this, [cell]);
			
			wConnection.setValue(cell.getAttribute('connection'));
			wSchema.setValue(cell.getAttribute('schema'));
			wTable.setValue(cell.getAttribute('table'));
			wCommit.setValue(cell.getAttribute('commit'));
			searchStore.loadData(Ext.decode(cell.getAttribute('key')));
		};
		
		this.saveData = function(){
			var data = {};
			data.connection = wConnection.getValue();
			data.schema = wSchema.getValue();
			data.table = wTable.getValue();
			data.commit = wCommit.getValue();
			data.key = Ext.encode(searchStore.toJson());
			
			return data;
		};
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 125,
				margins: '0 0 5 0',
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
					fieldLabel: BaseMessages.getString(PKG, "DeleteDialog.TargetSchema.Label"),
					xtype: 'compositefield',
					anchor: '-10',
					items: [wSchema, {
						xtype: 'button', text: BaseMessages.getString(PKG, "DeleteDialog.Browse.Button"), handler: function() {
							me.selectSchema(wConnection, wSchema);
						}
					}]
				},{
					fieldLabel: BaseMessages.getString(PKG, "DeleteDialog.TargetTable.Label"),
					xtype: 'compositefield',
					anchor: '-10',
					items: [wTable, {
						xtype: 'button', text: BaseMessages.getString(PKG, "DeleteDialog.Browse.Button"), handler: function() {
							me.selectTable(wConnection, wSchema, wTable);
						}
					}]
				}, wCommit]
			}, {
				title: BaseMessages.getString(PKG, "DeleteDialog.Key.Label"),
				xtype: 'KettleEditorGrid',
				region: 'center',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: BaseMessages.getString(PKG, "DeleteDialog.GetFields.Button"), scope: this, handler: function() {
							me.onSure(false);
							getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
								searchStore.merge(store, ['name', {name: 'condition', value: '='}, {name:'field', field: 'name'}]);
							});
						}
					});
					
					menu.insert(1, '-');
				},
				getDefaultValue: function() {
					return { field: '', condition: '=',  name: '', name2: '' };
				},
				columns: [new Ext.grid.RowNumberer(), {
					header: BaseMessages.getString(PKG, "DeleteDialog.ColumnInfo.TableField"), dataIndex: 'field', width: 100, editor: new Ext.form.ComboBox({
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
					header: BaseMessages.getString(PKG, "DeleteDialog.ColumnInfo.Comparator"), dataIndex: 'condition', width: 100, editor: new Ext.form.ComboBox({
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
					header: BaseMessages.getString(PKG, "DeleteDialog.ColumnInfo.StreamField1"), dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputFields(cell.getAttribute('label'))
					})
				},{
					header: BaseMessages.getString(PKG, "DeleteDialog.ColumnInfo.StreamField2"), dataIndex: 'name2', width: 100, editor: new Ext.form.ComboBox({
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
			}]
		};
		
		DeleteDialog.superclass.initComponent.call(this);
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

Ext.reg('Delete', DeleteDialog);