JobEntrySQLDialog = Ext.extend(KettleDialog, {
	width: 600,
	height: 400,
	title: 'SQL',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		var wSQL = new Ext.form.TextArea({
			fieldLabel: 'SQL脚本',
			hideLabel:true,
			anchor: '-10',
			region: 'center',
			flex: 1,
			height: 120,
			emptyText: 'SQL脚本',
			preventScrollbars:false
		});
		if(!Ext.isEmpty(cell.getAttribute('sql')))
			wSQL.setValue(decodeURIComponent(cell.getAttribute('sql')));
		
		
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
		
		var weditbutton =new Ext.Button({xtype: 'button', text: '编辑...', handler: function() {
			var databaseDialog = new DatabaseDialog();
			databaseDialog.on('create', onDatabaseCreate);
			databaseDialog.show(null, function() {
				databaseDialog.initTransDatabase(wConnection.getValue());
			});
		}});
	
		var wnewbutton =new Ext.Button({
			xtype: 'button', text: '新建...', handler: function() {
				var databaseDialog = new DatabaseDialog();
				databaseDialog.on('create', onDatabaseCreate);
				databaseDialog.show(null, function() {
					databaseDialog.initJobDatabase(null);
				});
			}
		});
		var wSqlfromfile = new Ext.form.Checkbox({fieldLabel: '从文件中得到的SQL',flex: 1, anchor: '-10', checked: cell.getAttribute('sqlfromfile')  == 'Y'});
		var wSqlfilename = new Ext.form.TextField({fieldLabel: 'SQL文件名', flex: 1,anchor: '-10', value: cell.getAttribute('sqlfilename')});
		var wfindbutton = new Ext.Button({
			text: '浏览(B)', 
			disabled:false,
			handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wSqlfilename.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		var wSendOneStatement = new Ext.form.Checkbox({fieldLabel: '将SQL脚本作为一条语句发送',anchor: '-10', checked: cell.getAttribute('sendOneStatement')  == 'Y'});
		var wUseVariableSubstitution = new Ext.form.Checkbox({fieldLabel: '使用变量替换',anchor: '-10', checked: cell.getAttribute('useVariableSubstitution') == 'Y'});

		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			region: 'north',
			height: 140,
			labelAlign: 'right',
            border:false,
			labelWidth: 160,
			items: [{xtype: 'compositefield',
				fieldLabel: '数据库连接',
				anchor: '-10',
				flex: 1,
				items: [wConnection,weditbutton,wnewbutton]
			},wSqlfromfile,{xtype: 'compositefield',
				fieldLabel: 'SQL文件名',
				anchor: '-10',
				flex: 1,
				items: [wSqlfilename,wfindbutton]
			},wSendOneStatement,wUseVariableSubstitution]
		});
		

	
		this.getValues = function(){
			return {
				sql: encodeURIComponent(wSQL.getValue()),
				connection : wConnection.getValue(),
				sqlfromfile : wSqlfromfile.getValue()   ? "Y" : "N"   ,
				sqlfilename : wSqlfilename.getValue(),
				sendOneStatement : wSendOneStatement.getValue()  ? "Y" : "N"    ,
				useVariableSubstitution : wUseVariableSubstitution.getValue()  ? "Y" : "N"   
			};
		};
		

//		this.fitItems = [form];
		
		

		this.fitItems ={layout: 'form',
		            border:false,
		items: [form, {
			bodyStyle: 'padding: 15px',
            layout: 'form', 
			region: 'souths',
			flex: 1,
	        border:false,
			height: 200,
			labelAlign: 'right',
			labelWidth: 0,
			hideLabel:true,
			items: [{xtype: 'label',
					text: 'SQL脚本',
					style: 'padding-top: 5px',
					height: 25},
				wSQL]}]};
	

		JobEntrySQLDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SQL', JobEntrySQLDialog);