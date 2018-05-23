JobEntryColumnsExistDialog = Ext.extend(KettleDialog, {
	title: '检查列是否存在',
	width: 500,
	height: 410,
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
		
		var store = new Ext.data.JsonStore({
			fields: ['field']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryColumnsExistDialog.superclass.initData.apply(this, [cell]);
			wConnection.setValue(cell.getAttribute('connection'));
			wSchema.setValue(cell.getAttribute('schemaname'));
			wTable.setValue(cell.getAttribute('tablename'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.connection = wConnection.getValue();
			data.schemaname = wSchema.getValue();
			data.tablename = wTable.getValue();
			data.fields = Ext.encode(store.toJson());
			return data;
		};
		
		this.fitItems = [{
			border: false,
			layout: 'border',
			
			
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 100,
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
			}, {
				region: 'center',
				title: '数据表字段',
				xtype: 'KettleEditorGrid',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取列名', scope: this, handler: function() {
							getActiveGraph().tableFields(wConnection.getValue(), wSchema.getValue(), wTable.getValue(), function(s) {
								store.merge(s, ['name', {name: 'condition', value: '='}, {name:'field', field: 'name'}]);
							}).load();
						}
					});
					
					menu.insert(1, '-');
				},
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
				}],
				store: store
			}]
		}];
		
		JobEntryColumnsExistDialog.superclass.initComponent.call(this);
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
		dialog.on('select', function(table, schema) {
			wTable.setValue(table);
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

Ext.reg('COLUMNS_EXIST', JobEntryColumnsExistDialog);