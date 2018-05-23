SHELLDialog = Ext.extend(KettleTabDialog, {
	width: 500,
	height: 650,
	title: '执行一个Shell脚本',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		

		var wInsertscript = new Ext.form.Checkbox({fieldLabel:'Insert Script',anchor:'-10',flex:1,checked:cell.getAttribute('insertScript')=='Y',
			listeners:{
				'check':function(checked){
					if(checked.checked){
						wFileName.setDisabled(true);
						wArgFromPrevious.setDisabled(true);
						wExecPerRow.setDisabled(true);
						grid.setDisabled(true);
					}else{

						wFileName.setDisabled(false);
						wArgFromPrevious.setDisabled(false);
						wExecPerRow.setDisabled(false);
						grid.setDisabled(false);
					}
				}
			}});
		
		var wFileName = new Ext.form.TextField({fieldLabel: '脚本文件名',anchor: '-10',flex: 1,value: cell.getAttribute('fileName')});
		var wWokrDirectory = new Ext.form.TextField({fieldLabel:"工作路径",anchor:'-10',flex:1,value:cell.getAttribute("work_directory")});
		var wSetLogfile = new Ext.form.Checkbox({fieldLabel: '指定日志文件',anchor: '-10', flex: 1,checked: cell.getAttribute('set_logfile') == 'Y',
			listeners:{
				'check':function(checked){
					if(checked.checked){
						wAppendLogfile.setDisabled(false);
						wLogfile.setDisabled(false);
						wLogext.setDisabled(false);
						wAddDate.setDisabled(false);
						wAddTime.setDisabled(false);
					}else{
						wAppendLogfile.setDisabled(true);
						wLogfile.setDisabled(true);
						wLogext.setDisabled(true);
						wAddDate.setDisabled(true);
						wAddTime.setDisabled(true);
					}
				}
			}});
		
		var wAppendLogfile = new Ext.form.Checkbox({fieldLabel:'追加日志文件',anchor:'-10',flex:1,checked:cell.getAttribute('set_append_logfile')=='Y'});
		var wLogfile = new Ext.form.TextField({fieldLabel:'日志文件名称',anchor:'-10',flex:1,value:cell.getAttribute('logfile')});
		var wLogext = new Ext.form.TextField({fieldLabel:'日志文件扩展名',anchor:'-10',flex:1,value:cell.getAttribute("logext")});
		var wAddDate = new Ext.form.Checkbox({fieldLabel:'日志文件中包含日期',anchor:'-10',flex:1,checked:cell.getAttribute('add_date')=='Y'});
		var wAddTime = new Ext.form.Checkbox({fieldLabel:'日志文件中包含时间',anchor:'-10',flex:1,checked:cell.getAttribute('add_time')=='Y'});
		//var loglevelStore = new Ext.data.ArrayStore({fields: ['id', 'name'],data: [['Nothing', '没有日志'], ['error', '错误日志'], ['min', '最小日志']]});
		var loglevelStore =  Ext.StoreMgr.get('logLevelStore');
		var wLoglevel = new Ext.form.ComboBox({fieldLabel:'日志级别',anchor:'',flex:1,store:loglevelStore,displayField: 'desc',valueField: 'code',editable: false,mode: 'local',triggerAction: 'all',value:cell.getAttribute('loglevel')});
		var file = new Ext.form.TextField({fieldLabel: '文件上传',inputType: 'file', allowBlank: false,name: 'imgFile',});
		var wJs = new Ext.form.TextArea({emptyText: '请输入js语句',value: decodeURIComponent(cell.getAttribute('script'))});
		
		var wArgFromPrevious = new Ext.form.Checkbox({fieldLabel:'将上一个结果作为参数',anchor:'-10',flex:1,checked:cell.getAttribute('arg_from_previous')=='Y'});
		var wExecPerRow = new Ext.form.Checkbox({fieldLabel:'对每个输入行执行一次',anchor:'-10',flex:1,checked:cell.getAttribute('exec_per_row')=='Y'});
		
		var store = new Ext.data.JsonStore({
			fields: ['argument'],
			data: Ext.decode(cell.getAttribute('args') || Ext.encode([]))
		});
		
		this.getValues = function(){
			return {
				fileName: wFileName.getValue(),
				work_directory:wWokrDirectory.getValue(),
				set_logfile:wSetLogfile.getValue()?'Y':'N',
				set_append_logfile:	wAppendLogfile.getValue()?'Y':'N',
				logfile:wLogfile.getValue(),
				logext:wLogext.getValue(),
				add_date:wAddDate.getValue()?'Y':'N',
				add_time:wAddTime.getValue()?'Y':'N',
				insertScript:wInsertscript.getValue()?'Y':'N',
				script:wJs.getValue(),
				loglevel:wLoglevel.getValue(),
				arg_from_previous:wArgFromPrevious.getValue()?'Y':'N',
				exec_per_row:wExecPerRow.getValue()?'Y':'N',
				args:Ext.encode(store.toJson())
			};
		};
		var grid = new KettleEditorGrid({
			region: 'center',
			height: 70,
			autoScroll : true,
			columns: [new Ext.grid.RowNumberer(),{
				header: '字段', dataIndex: 'argument', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		if(wSetLogfile.getValue()){
			wAppendLogfile.setDisabled(false);
			wLogfile.setDisabled(false);
			wLogext.setDisabled(false);
			wAddDate.setDisabled(false);
			wAddTime.setDisabled(false);
		}else{
			wAppendLogfile.setDisabled(true);
			wLogfile.setDisabled(true);
			wLogext.setDisabled(true);
			wAddDate.setDisabled(true);
			wAddTime.setDisabled(true);
		}
		if(wInsertscript.getValue()){
			wFileName.setDisabled(true);
			wArgFromPrevious.setDisabled(true);
			wExecPerRow.setDisabled(true);
			grid.setDisabled(true);
		}else{
			wFileName.setDisabled(false);
			wArgFromPrevious.setDisabled(false);
			wExecPerRow.setDisabled(false);
			grid.setDisabled(false);
		}
		this.tabItems = [{ 
			xtype: 'KettleForm',
			title: 'General',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 130,
			items: [wInsertscript,wFileName,{
				xtype: 'button', text: '浏览...', handler: function() {
					var dialog = new FileWindow();
					dialog.on('ok', function(path) {
						wFileName.setValue(path);
						dialog.close();
					});
					dialog.show();
				}
			},wWokrDirectory,{
				xtype: 'fieldset',
				bodyStyle: 'padding: 10px 10px',
				title: '日志设置',
				anchor: '-10',
				items: [wSetLogfile,wAppendLogfile,wLogfile,wLogext,wAddDate,wAddTime,wLoglevel]
			},wArgFromPrevious,wExecPerRow,grid]
		},{xtype: 'KettleForm',
			title: 'Script',
			bodyStyle: 'padding: 10px 10px',
			layout: 'fit',
			labelWidth: 1,
			items:wJs}];
		
		SHELLDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SHELL', SHELLDialog);