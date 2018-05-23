SynchronizeAfterMergeDialog = Ext.extend(KettleTabDialog, {
	title: 'Synchronize After Merge',
	width: 800,
	height: 600,
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
		var wCommit = new Ext.form.TextField({ fieldLabel: '提交的记录数量', anchor: '-10', value: cell.getAttribute('commit')});
		var wBatch = new Ext.form.Checkbox({ fieldLabel: '批量更新', checked: cell.getAttribute('use_batch') == 'Y' });
		var wTablenameInField = new Ext.form.Checkbox({ fieldLabel: '表名在字段里定义', checked: cell.getAttribute('tablename_in_field') == 'Y' });
		var wTableField = new Ext.form.TextField({ fieldLabel: '表名字段', anchor: '-10', value: cell.getAttribute('tablename_field')});
		
		///-----------------------------------------advance---------------------------------------------------
		var wOperationField = new Ext.form.ComboBox({
			fieldLabel: '操作字段名',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label')),
			value: cell.getAttribute('operation_order_field')
		});
		var wOrderInsert = new Ext.form.TextField({ fieldLabel: '当值相等时插入', anchor: '-10', value: cell.getAttribute('order_insert')});
		var wOrderUpdate = new Ext.form.TextField({ fieldLabel: '当值相等时更新', anchor: '-10', value: cell.getAttribute('order_update')});
		var wOrderDelete = new Ext.form.TextField({ fieldLabel: '当值相等时删除', anchor: '-10', value: cell.getAttribute('order_delete')});
		var wPerformLookup = new Ext.form.Checkbox({ fieldLabel: '执行查询', checked: cell.getAttribute('perform_lookup') == 'Y' });
		
		var searchStore = new Ext.data.JsonStore({
			idProperty: 'field',
			fields: ['field', 'name', 'condition', 'name2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'update'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				use_batch: wBatch.getValue() ? "Y" : "N",
				tablename_in_field: wTablenameInField.getValue() ? "Y" : "N",
				tablename_field: wTableField.getValue(),		
				operation_order_field: wOperationField.getValue(),
				order_insert: wOrderInsert.getValue(),
				order_update: wOrderUpdate.getValue(),
				order_delete: wOrderDelete.getValue(),
				perform_lookup: wPerformLookup.getValue() ? "Y" : "N",
				searchFields: Ext.encode(searchStore.toJson()),
				updateFields: Ext.encode(updateStore.toJson())
			};
		};
		
		this.tabItems = [{
			title: '一般',
			layout: 'border',
			defaults: {border: false},
			items: [{
				region: 'north',
				height: 200,
				bodyStyle: 'padding: 15px 0px',
				xtype: 'KettleForm',
				items: [{
					fieldLabel: '数据库连接',
					xtype: 'compositefield',
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
						xtype: 'button',
						text: '向导...'
					}]
				}, {
					fieldLabel: '目的模式',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wSchema, {
						xtype: 'button', text: '浏览...', handler: function() {
							me.selectSchema(wConnection, wSchema);
						}
					}]
				}, {
					fieldLabel: '目标表',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wTable, {
						xtype: 'button', text: '浏览...', handler: function() {
							me.selectTable(wConnection, wSchema, wTable);
						}
					}]
				}, wCommit, wBatch, wTablenameInField, wTableField]
			}, {
				title: '用来查询的关键字',
				xtype: 'KettleEditorGrid',
				region: 'center',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取字段', scope: this, handler: function() {
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
				xtype: 'KettleEditorGrid',
				region: 'south',
				height: 100,
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取更新字段', scope: this, handler: function() {
							me.onSure(false);
							getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
								updateStore.merge(store, ['name', {name:'rename', field: 'name'}, {name: 'update', value: 'Y'}]);
							});
						}
					});
					menu.insert(1, {
						text: '编辑映射', scope: this, handler: function() {
						}
					});
					menu.insert(2, '-');
				},
				getDefaultValue: function() {
					return {  name: '', rename: '',  update: 'N'  };
				},
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
			}]
		}, {
			title: '高级',
			bodyStyle: 'padding: 10px',
			xtype: 'KettleForm',
			items: [{
				xtype: 'fieldset',
				title: '操作',
				items: [wOperationField, wOrderInsert, wOrderUpdate, wOrderDelete, wPerformLookup]
			}]
		}];
		
		SynchronizeAfterMergeDialog.superclass.initComponent.call(this);
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

Ext.reg('SynchronizeAfterMerge', SynchronizeAfterMergeDialog);