ExecSQLDialog = Ext.extend(KettleTabDialog, {
	title: '执行SQL语句',
	width: 600,
	height: 400,
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
		
		var wSQL = new Ext.form.TextArea({
			emptyText: 'SQL语句，多个语句之间请用;分割'
		});
		if(!Ext.isEmpty(cell.getAttribute('sql')))
			wSQL.setValue(decodeURIComponent(cell.getAttribute('sql')));
		
		var wEachRow = new Ext.form.Checkbox({fieldLabel: '执行每一行', checked: cell.getAttribute('executedEachInputRow') == 'Y'});
		var wSingleStatement = new Ext.form.Checkbox({fieldLabel: 'Execute as a single statement', checked: cell.getAttribute('singleStatement') == 'Y'});
		var wVariables = new Ext.form.Checkbox({fieldLabel: '变量替换', checked: cell.getAttribute('replaceVariables') == 'Y'});
		var wSetParams = new Ext.form.Checkbox({fieldLabel: '绑定参数', checked: cell.getAttribute('setParams') == 'Y'});
		var wQuoteString = new Ext.form.Checkbox({fieldLabel: 'Quote String', checked: cell.getAttribute('quoteString') == 'Y'});
		
		var wInsertField = new Ext.form.TextField({fieldLabel: '包含插入状态的字段',  anchor: '-10', value: cell.getAttribute('insert_field')});
		var wUpdateField = new Ext.form.TextField({fieldLabel: '包含更新状态的字段',  anchor: '-10', value: cell.getAttribute('update_field')});
		var wDeleteField = new Ext.form.TextField({fieldLabel: '包含删除状态的字段',  anchor: '-10', value: cell.getAttribute('delete_field')});
		var wReadField = new Ext.form.TextField({fieldLabel: '包含读状态的字段',  anchor: '-10', value: cell.getAttribute('read_field')});
		
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			data: Ext.decode(cell.getAttribute('arguments')) || []
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				sql: encodeURIComponent(wSQL.getValue()),
				executedEachInputRow: wEachRow.getValue() ? "Y" : "N",
				singleStatement: wSingleStatement.getValue() ? "Y" : "N",
				replaceVariables: wVariables.getValue() ? "Y" : "N",
				setParams: wSetParams.getValue() ? "Y" : "N",
				quoteString: wQuoteString.getValue() ? "Y" : "N",
				insert_field: wInsertField.getValue(),
				update_field: wUpdateField.getValue(),
				delete_field:  wDeleteField.getValue(),
				read_field:  wReadField.getValue(),
				arguments: Ext.encode(store.toJson())
			};
		};
		
		var parameters = new Ext.grid.EditorGridPanel({
			title: '参数',
			tbar: [{
				text: '增加参数', handler: function() {
	                var record = new store.recordType({name: ''});
	                parameters.stopEditing();
	                parameters.getStore().insert(0, record);
	                parameters.startEditing(0, 0);
				}
			},{
				text: '删除参数'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '作为参数的字段', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}],
			store: store
		});
		
		this.tabItems = [{
			title: '基本配置',
			layout: 'border',
			defaults: {border: false},
			items: [{
				region: 'north',
				height: 30,
				xtype: 'KettleForm',
				bodyStyle: 'padding-top: 5px',
				labelWidth: 80,
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
						xtype: 'button',
						text: '向导...'
					}]
				}]
			}, {
				bodyStyle: 'padding: 5px 10px;',
				layout: 'fit',
				region: 'center',
				items: wSQL
			}]
		},{
			title: '细节',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 5px',
			labelWidth: 180,
			items: [wEachRow, wSingleStatement, wVariables, wSetParams, wQuoteString,
			        wInsertField, wUpdateField, wDeleteField, wReadField]
		}, parameters];
		
		ExecSQLDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('ExecSQL', ExecSQLDialog);