TextFileOutputDialog = Ext.extend(KettleTabDialog, {
	width: 700,
	height: 550,
	title: '文本文件输出',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var wFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('file_name')});
		var wFileIsCommand = new Ext.form.Checkbox({fieldLabel: '结果输送至命令行或脚本', checked: cell.getAttribute('is_command') == 'Y'});
		var wServletOutput = new Ext.form.Checkbox({fieldLabel: '输出传递到Servlet', checked: cell.getAttribute('servlet_output') == 'Y'});
		var wCreateParentFolder = new Ext.form.Checkbox({fieldLabel: '创建父目录', checked: cell.getAttribute('create_parent_folder') == 'Y'});
		var wDoNotOpenNewFileInit = new Ext.form.Checkbox({fieldLabel: '启动时不创建文件', checked: cell.getAttribute('do_not_open_new_file_init') == 'Y'});
		var wFileNameInField = new Ext.form.Checkbox({fieldLabel: '从字段中获取文件名', checked: cell.getAttribute('fileNameInField') == 'Y'});
		var wFileNameField = new Ext.form.ComboBox({
			fieldLabel: '文件名字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label')),
			value: cell.getAttribute('fileNameField')
		});
		var wExtension = new Ext.form.TextField({fieldLabel: '扩展名', anchor: '-10', value: cell.getAttribute('extention')});
		var wAddStepnr = new Ext.form.Checkbox({fieldLabel: '文件名里包含步骤数', checked: cell.getAttribute('split') == 'Y'});
		var wAddPartnr = new Ext.form.Checkbox({fieldLabel: '文件名里包含数据分区号', checked: cell.getAttribute('haspartno') == 'Y'});
		var wAddDate = new Ext.form.Checkbox({fieldLabel: '文件名里包含日期', checked: cell.getAttribute('add_date') == 'Y'});
		var wAddTime = new Ext.form.Checkbox({fieldLabel: '文件名里包含时间', checked: cell.getAttribute('add_time') == 'Y'});
		var wSpecifyFormat = new Ext.form.Checkbox({fieldLabel: '指定日期时间格式', checked: cell.getAttribute('SpecifyFormat') == 'Y'});
		var wDateTimeFormat = new Ext.form.ComboBox({
			fieldLabel: '时间日期格式',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('datetimeFormatStore'),
			value: cell.getAttribute('date_time_format')
		});
		var wAddToResult = new Ext.form.Checkbox({fieldLabel: '结果中添加文件名', checked: cell.getAttribute('add_to_result_filenames') == 'Y'});
		
		var wAppend = new Ext.form.Checkbox({fieldLabel: '追加方式', checked: cell.getAttribute('append') == 'Y'});
		var wSeparator = new Ext.form.TextField({flex: 1, value: cell.getAttribute('separator')});
		var wEnclosure = new Ext.form.TextField({fieldLabel: '封闭符', anchor: '-10', value: cell.getAttribute('enclosure')});
		var wEnclForced = new Ext.form.Checkbox({fieldLabel: '强制在字段周围加封闭符', checked: cell.getAttribute('enclosure_forced') == 'Y'});
		var wDisableEnclosureFix = new Ext.form.Checkbox({fieldLabel: '禁用封闭符修复', checked: cell.getAttribute('enclosure_fix_disabled') == 'Y'});
		var wHeader = new Ext.form.Checkbox({fieldLabel: '头部', checked: cell.getAttribute('header') == 'Y'});
		var wFooter = new Ext.form.Checkbox({fieldLabel: '尾部', checked: cell.getAttribute('footer') == 'Y'});
		var wFormat = new Ext.form.ComboBox({
			fieldLabel: '格式',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('formatMapperLineTerminatorStore'),
			value: cell.getAttribute('format')
		});
		var wCompression = new Ext.form.ComboBox({
			fieldLabel: '压缩',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('compressionProviderNamesStore'),
			value: cell.getAttribute('compression')
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
		var wPad = new Ext.form.Checkbox({fieldLabel: '字段右填充或裁剪', checked: cell.getAttribute('pad') == 'Y'});
		var wFastDump = new Ext.form.Checkbox({fieldLabel: '快速存储数据(无格式)', checked: cell.getAttribute('fast_dump') == 'Y'});
		var wSplitEvery = new Ext.form.TextField({fieldLabel: '分拆...每一行', anchor: '-10', value: cell.getAttribute('splitevery')});
		var wEndedLine = new Ext.form.TextField({fieldLabel: '添加文件结束行', anchor: '-10', value: cell.getAttribute('endedLine')});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format', 'length', 'precision', 'currency', 'decimal', 'group', 'trim_type', 'nullif'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		this.getValues = function(){
			return {
				file_name: wFilename.getValue(),
				is_command: wFileIsCommand.getValue() ? "Y" : "N",
				servlet_output: wServletOutput.getValue() ? "Y" : "N",
				create_parent_folder: wCreateParentFolder.getValue() ? "Y" : "N",
				do_not_open_new_file_init: wDoNotOpenNewFileInit.getValue() ? "Y" : "N",
				fileNameInField: wFileNameInField.getValue() ? "Y" : "N",
				fileNameField: wFileNameField.getValue(),
				extention: wExtension.getValue(),
				split: wAddStepnr.getValue() ? "Y" : "N",
				haspartno: wAddPartnr.getValue() ? "Y" : "N",
				add_date: wAddDate.getValue() ? "Y" : "N",
				add_time: wAddTime.getValue() ? "Y" : "N",
				SpecifyFormat: wSpecifyFormat.getValue() ? "Y" : "N",
				date_time_format: wDateTimeFormat.getValue(),
				add_to_result_filenames: wAddToResult.getValue() ? "Y" : "N",
																
				append: wAppend.getValue() ? "Y" : "N",
				separator: wSeparator.getValue(),
				enclosure: wEnclosure.getValue(),
				enclosure_forced: wEnclForced.getValue() ? "Y" : "N",
				enclosure_fix_disabled: wDisableEnclosureFix.getValue() ? "Y" : "N",
				header: wHeader.getValue() ? "Y" : "N",
				footer: wFooter.getValue() ? "Y" : "N",
				format: wFormat.getValue(),
				compression: wCompression.getValue(),
				encoding: wEncoding.getValue(),
				pad: wPad.getValue() ? "Y" : "N",
				fast_dump: wFastDump.getValue() ? "Y" : "N",
				splitevery: wSplitEvery.getValue(),
				endedLine: wEndedLine.getValue(),
				fields: Ext.encode(store.toJson())
			};
		};
		
		this.tabItems = [{
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
			items: [{
				xtype: 'compositefield',
				fieldLabel: '文件名称',
				anchor: '-10',
				items: [wFilename, {
					xtype: 'button', text: '浏览..', handler: function() {
						var dialog = new FileExplorerWindow();
						dialog.on('ok', function(path) {
							wFilename.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}, wFileIsCommand, wServletOutput, wCreateParentFolder, wDoNotOpenNewFileInit, wFileNameInField, wFileNameField,
			wExtension, wAddStepnr, wAddPartnr, wAddDate, wAddTime, wSpecifyFormat, wDateTimeFormat, wAddToResult]
		},{
			xtype: 'KettleForm',
			title: '内容',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
			items: [wAppend, {
				xtype: 'compositefield',
				fieldLabel: '分割符',
				anchor: '-10',
				items: [wSeparator, {
					xtype: 'button', text: '插入TAB', handler: function() {
						wSeparator.setValue('\t' + wSeparator.getValue());
					}
				}]
			},wEnclosure, wEnclForced, wDisableEnclosureFix, wHeader, wFooter, wFormat, wCompression, 
			wEncoding, wPad, wFastDump, wSplitEvery, wEndedLine]
		}, {
			xtype:'KettleEditorGrid',
			region: 'center',
			title: '字段',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取变量', scope: this, handler: function() {
						me.onSure();
						
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(st) {
							store.loadData(st.toJson());
						});
					}
				});
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueFormatStore'),
			        displayField:'name',
			        valueField:'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: '货币', dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: '小数', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: '分组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '去除空字符串方式', dataIndex: 'trim_type', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return '不去掉空格'; 
					else if(v == 'left') 
						return '去掉左空格';
					else if(v == 'right') 
						return '去掉右空格';
					else if(v == 'both') 
						return '去掉左右两端空格';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: '不去掉空格'},
			        	       {value: 'left', text: '去掉左空格'},
			        	       {value: 'right', text: '去掉右空格'},
			        	       {value: 'both', text: '去掉左右两端空格'}]
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
				header: 'Null', dataIndex: 'nullif', width: 80, editor: new Ext.form.TextField()
			}],
			store: store
		}];
		TextFileOutputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('TextFileOutput', TextFileOutputDialog);