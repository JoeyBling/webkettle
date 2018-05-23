JobEntryEvalTableContentDialog = Ext.extend(KettleDialog, {
	width: 450,
	height: 600,
	autoScroll: true,
	title: '计算表中的记录数',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
	
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			anchor: '-20',
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
		
		var wGetSQLbutton =new Ext.Button({
            buttonAlign : 'right',
			xtype: 'button', text: '获取  SELECT SQL', handler: function() {
				var store = getActiveGraph().getDatabaseStore();
				store.each(function(item) {
					if(item.get('name') == wConnection.getValue()) {
						me.getSQL(item.json, wCustomSQL);
					}
				});
			}
		});		
		var wEditbutton =new Ext.Button({xtype: 'button', text: '编辑...', handler: function() {
			var store = getActiveGraph().getDatabaseStore();
			store.each(function(item) {
				if(item.get('name') == wConnection.getValue()) {
					var databaseDialog = new DatabaseDialog();
					databaseDialog.on('create', onDatabaseCreate);
					databaseDialog.show(null, function() {
						databaseDialog.initDatabase(item.json);
					});
				}
			});
		}});
	
		var wNewbutton =new Ext.Button({
			xtype: 'button', text: '新建...', handler: function() {
				var databaseDialog = new DatabaseDialog();
				databaseDialog.on('create', onDatabaseCreate);
				databaseDialog.show();
			}
		});
		
		var wWizardbutton =new Ext.Button({
			     text: 'wizard', handler: function() {
				var databaseDialog = new DatabaseDialog();
				databaseDialog.on('create', onDatabaseCreate);
				databaseDialog.show();
			}
		});
		var wSchemaname = new Ext.form.TextField({fieldLabel: '目标模式', flex: 1,	anchor: '0', value: cell.getAttribute('schemaname')});
		var wTablename = new Ext.form.TextField({fieldLabel: '目标表名称', flex: 1,anchor: '-10', value: cell.getAttribute('tablename')});
		var wFindbutton = new Ext.Button({
			text: '浏览(B)', 
			disabled:false,
			handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wTablename.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		var wSuccessCondition = new Ext.form.ComboBox({
			fieldLabel: '满足成功条件行数',
			flex: 1,
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			value: cell.getAttribute('successCondition'),
			store: Ext.StoreMgr.get('successConditionStore')
			});
		var wlimit = new Ext.form.TextField({fieldLabel: '数值',anchor: '-10', value: cell.getAttribute('limit')});
		var wIscustomSQL = new Ext.form.Checkbox({fieldLabel: '自定义SQL',anchor: '-10', 
			checked: cell.getAttribute('iscustomSQL') == 'Y',    
			listeners:{
				'check':function(checked){
					if(checked.checked)
				   {
						wSchemaname.setDisabled(true);
						wTablename.setDisabled(true);
						wFindbutton.setDisabled(true);
						wIsUseVars.setDisabled(false);
						wIsClearResultList.setDisabled(false);
						wIsAddRowsResult.setDisabled(false);
						wCustomSQL.setDisabled(false);
						wCustomwGetSQLbutton.setDisabled(false);
					}else{
						wSchemaname.setDisabled(false);
						wTablename.setDisabled(false);
						wFindbutton.setDisabled(false);
						wIsUseVars.setDisabled(true);
						wIsClearResultList.setDisabled(true);
						wIsAddRowsResult.setDisabled(true);
						wCustomSQL.setDisabled(true);
						wCustomwGetSQLbutton.setDisabled(true);
			        }
			    }
			 }});
		var wIsUseVars = new Ext.form.Checkbox({fieldLabel: '使用变量替换',anchor: '-10',	disabled:true, checked: cell.getAttribute('isUseVars')== 'Y'});
		var wIsClearResultList = new Ext.form.Checkbox({fieldLabel: '在执行前清空结果行列',anchor: '-10', disabled:true, checked: cell.getAttribute('isClearResultList')== 'Y'});
		var wIsAddRowsResult = new Ext.form.Checkbox({fieldLabel: '在结果中添加行',anchor: '-10',disabled:true,  checked: cell.getAttribute('isAddRowsResult')== 'Y'});
		var wCustomSQL = new Ext.form.TextArea({
				fieldLabel: 'SQL脚本',
				hideLabel:true,
				disabled:true, 
				anchor: '-10',
				region: 'center',
				flex: 1,
				height: 100,
				emptyText: 'SQL脚本',
				preventScrollbars:false
			});
			if(!Ext.isEmpty(cell.getAttribute('customSQL')))
				wCustomSQL.setValue(decodeURIComponent(cell.getAttribute('customSQL')));
			
			
			var wCustomwGetSQLbutton=	new Ext.Button({
				xtype: 'button', 
				disabled:true, 
                text: '获取SELECT SQL. .', handler: function() {
					var store = getActiveGraph().getDatabaseStore();
					store.each(function(item) {
						if(item.get('name') == wConnection.getValue()) {
							me.getSQL(item.json, wCustomSQL);
						}
					});
				}
			});
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			region: 'north',
			labelAlign: 'right',
			labelWidth: 130,
			height: 600,
            border:false,
			items: [{xtype: 'compositefield',
				fieldLabel: '数据库连接',
				anchor: '0',
				labelWidth: 130,
				labelAlign: 'right',
				flex: 1,
				items: [wConnection,wEditbutton,wNewbutton]
			},wSchemaname,{xtype: 'compositefield',
				fieldLabel: '目标表名称',
				labelWidth: 130,
				labelAlign: 'right',
				anchor: '0',
				flex: 1,
				items: [wTablename,wFindbutton]
			},{
				xtype: 'fieldset',
				title: '成功条件',
				labelAlign: 'right',
				labelWidth: 130,
				items: [wSuccessCondition, wlimit]
			},{
			xtype: 'fieldset',
			title: '自定义SQL',
			items: [{layout: 'form', 
	            flex: 1,
				labelWidth: 130,
	            border:false,
				labelAlign: 'right',
	            items: [wIscustomSQL, wIsUseVars,wIsClearResultList,wIsAddRowsResult]},
			        { layout:'column',   
	                border:false,
                    buttonAlign:'right',  
	                items:[{xtype: 'label',
						text: 'SQL脚本',
				        columnWidth: 1,  
						style: 'padding-top: 5px',
						height: 25},wCustomwGetSQLbutton]},wCustomSQL]
			}
		]
		});
		

	
		this.getValues = function(){
			return {
				customSQL: encodeURIComponent(wCustomSQL.getValue()),
				connection : wConnection.getValue(),
				schemaname : wSchemaname.getValue()   ,
				tablename : wTablename.getValue(),
				successCondition : wSuccessCondition.getValue()   ,
				limit : wlimit.getValue()   ,
				iscustomSQL : wIscustomSQL.getValue()  ? "Y" : "N"    ,
				isUseVars : wIsUseVars.getValue()  ? "Y" : "N"    ,
				isClearResultList : wIsClearResultList.getValue()  ? "Y" : "N"    ,
				isAddRowsResult : wIsAddRowsResult.getValue()  ? "Y" : "N"    
			};
		};
		

//		this.fitItems = [form];
		
		

		this.fitItems ={layout: 'form',
		            border:false,
		items: [form]};
	

		JobEntryEvalTableContentDialog.superclass.initComponent.call(this);
	},
	getSQL: function(dbInfo, wCustomSQL) {
		var dialog = new DatabaseExplorerDialog();
		dialog.on('select', function(node) {
			var schema = node.attributes.schema;
			var table = node.text;
			
			wCustomSQL.setValue('select * from ' + schema + '.' + table);
			dialog.close();
			
			Ext.Msg.show({
				   title:'系统提示',
				   msg: '你想在SQL里面包含字段名吗？',
				   buttons: Ext.Msg.YESNO,
				   icon: Ext.MessageBox.QUESTION,
				   fn: function(bId) {
					   if(bId == 'yes') {
						   getActiveGraph().tableFields(dbInfo.name, schema, table, function(store) {
							   var data = [];
							   store.each(function(rec) {
								   data.push('\n\t' + rec.get('name'));
							   });
							   wCustomSQL.setValue('select ' + data.join(',') + '\n from ' + schema + '.' + table);
						   });
					   }
				   }
			});
			
		});
		dialog.show(null, function() {
			dialog.initDatabase(dbInfo);
		});
	}
});

Ext.reg('EVAL_TABLE_CONTENT', JobEntryEvalTableContentDialog);