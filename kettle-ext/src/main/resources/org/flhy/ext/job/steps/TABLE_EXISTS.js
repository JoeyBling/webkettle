JobEntryTableExistsDialog = Ext.extend(KettleDialog, {
	title: '检查表是否存在',
	width: 450,
	height: 210,
	initComponent: function() {
		var me = this,cell = getActiveGraph().getGraph().getSelectionCell();
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
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryTableExistsDialog.superclass.initData.apply(this, [cell]);
			
			wConnection.setValue(cell.getAttribute('connection'));
			wSchema.setValue(cell.getAttribute('schemaname'));
			wTable.setValue(cell.getAttribute('tablename'));
		};
		
		this.saveData = function(){
			var data = {};
			data.connection = wConnection.getValue();
			data.schemaname = wSchema.getValue();
			data.tablename = wTable.getValue();
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
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
			}]
		}];
		
		JobEntryTableExistsDialog.superclass.initComponent.call(this);
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

Ext.reg('TABLE_EXISTS', JobEntryTableExistsDialog);