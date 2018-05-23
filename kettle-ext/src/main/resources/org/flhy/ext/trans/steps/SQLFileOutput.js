SQLFileOutputDialog = Ext.extend(KettleTabDialog, {
	title: BaseMessages.getString(PKG, "SQLFileOutputDialog.DialogTitle"),
	width: 600,
	height: 650,
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
		
		var wAddCreate = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.CreateTable.Label"), checked: cell.getAttribute('create') == 'Y' });
		var wTruncate = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.TruncateTable.Label"), checked: cell.getAttribute('truncate') == 'Y' });
		var wStartNewLine = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.StartNewLine.Label"), checked: cell.getAttribute('startnewline') == 'Y' });
		var wFilename = new Ext.form.TextField({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.Filename.Label"), flex: 1, value: cell.getAttribute('name')});
		var wCreateParentFolder = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.CreateParentFolder.Label"), checked: cell.getAttribute('create_parent_folder') == 'Y' });
		var wDoNotOpenNewFileInit = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.DoNotOpenNewFileInit.Label"), checked: cell.getAttribute('DoNotOpenNewFileInit') == 'Y' });
		
		var wExtension = new Ext.form.TextField({ fieldLabel: '扩展名', anchor: '-10', value: cell.getAttribute('extention')});
		var wAddStepnr = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.AddStepnr.Label"), checked: cell.getAttribute('split') == 'Y' });
		var wAddDate = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.AddDate.Label"), checked: cell.getAttribute('add_date') == 'Y' });
		var wAddTime = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.AddTime.Label"), checked: cell.getAttribute('add_time') == 'Y' });
		var wAppend = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.Append.Label"), checked: cell.getAttribute('append') == 'Y' });
		var wSplitEvery = new Ext.form.TextField({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.SplitEvery.Label"), anchor: '-10', value: cell.getAttribute('splitevery')});
		var wAddToResult = new Ext.form.Checkbox({ fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.AddFileToResult.Label"), checked: cell.getAttribute('addtoresult') == 'Y' });
		var wFormat = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.DateFormat.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('datetimeFormatStore'),
			value: cell.getAttribute('dateformat')
		});
		var wEncoding = new Ext.form.ComboBox({
			fieldLabel: '编码',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('availableCharsetsStore'),
			value: cell.getAttribute('encoding')
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				
				create: wAddCreate.getValue() ? "Y" : "N",
				truncate: wTruncate.getValue() ? "Y" : "N",
				startnewline: wStartNewLine.getValue() ? "Y" : "N",
				name: wFilename.getValue(),
				create_parent_folder: wCreateParentFolder.getValue() ? "Y" : "N",
				DoNotOpenNewFileInit: wDoNotOpenNewFileInit.getValue() ? "Y" : "N",
				extention: wExtension.getValue(),
				split: wAddStepnr.getValue() ? "Y" : "N",
				add_date: wAddDate.getValue() ? "Y" : "N",
				add_time: wAddTime.getValue() ? "Y" : "N",
				append: wAppend.getValue() ? "Y" : "N",
				splitevery: wSplitEvery.getValue(),
				addtoresult: wAddToResult.getValue() ? "Y" : "N",
								
				dateformat: wFormat.getValue(),
				encoding: wEncoding.getValue()
			};
		};
		
		this.tabItems = [{
			title: BaseMessages.getString(PKG, "SQLFileOutputDialog.GeneralTab.TabTitle"),
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 140,
			items: [{
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "SQLFileOutputDialog.Group.ConnectionInfos.Label"),
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
					fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.TargetSchema.Label"),
					xtype: 'compositefield',
					anchor: '-10',
					items: [wSchema, {
						xtype: 'button', text: '浏览...', handler: function() {
							me.selectSchema(wConnection, wSchema);
						}
					}]
				},{
					fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.TargetTable.Label"),
					xtype: 'compositefield',
					anchor: '-10',
					items: [wTable, {
						xtype: 'button', text: '浏览...', handler: function() {
							me.selectTable(wConnection, wSchema, wTable);
						}
					}]
				}]
			}, {
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "SQLFileOutputDialog.SelectOutputFiles.DialogTitle"),
				items: [wAddCreate, wTruncate, wStartNewLine, {
					xtype: 'compositefield',
					fieldLabel: BaseMessages.getString(PKG, "SQLFileOutputDialog.Filename.Label"),
					anchor: '-10',
					items: [wFilename,{
    					xtype: 'button',
    					text: '浏览...'
    				},{
    					xtype: 'button',
    					text: '显示文件夹'
    				}]
				}, wCreateParentFolder, wDoNotOpenNewFileInit, wExtension, wAddStepnr, wAddDate, wAddTime, wAppend, wSplitEvery, wAddToResult]
			}]
		},{
			title: BaseMessages.getString(PKG, "SQLFileOutputDialog.ContentTab.TabTitle"),
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 10px',
			items: [wFormat, wEncoding]
		}];
		
		SQLFileOutputDialog.superclass.initComponent.call(this);
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

Ext.reg('SQLFileOutput', SQLFileOutputDialog);