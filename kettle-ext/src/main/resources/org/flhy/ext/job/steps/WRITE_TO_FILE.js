JobEntryWriteToFileDialog = Ext.extend(KettleDialog, {
	title: '创建文件',
	width: 450,
	height: 400,
	initComponent: function() {
		var me = this;
		
		var wFilename = new Ext.form.TextField({ flex: 1});
		var wCreateParentFolder = new Ext.form.Checkbox({ fieldLabel: '创建父文件夹'});
		var wAppendFile = new Ext.form.Checkbox({ fieldLabel: '追加方式'});
		
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
		var wContent = new Ext.form.TextArea({fieldLabel: '内容', anchor: '-10'});
		
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryWriteToFileDialog.superclass.initData.apply(this, [cell]);
			
			wFilename.setValue(cell.getAttribute('filename'));
			wCreateParentFolder.setValue('Y' == cell.getAttribute('createParentFolder'));
			wAppendFile.setValue('Y' == cell.getAttribute('appendFile'));
			
			wEncoding.setValue(cell.getAttribute('encoding'));
			
			if(!Ext.isEmpty(cell.getAttribute('content')))
				wContent.setValue(decodeURIComponent(cell.getAttribute('content')));
		};
		
		this.saveData = function(){
			var data = {};
			data.filename = wFilename.getValue();
			data.createParentFolder = wCreateParentFolder.getValue() ? 'Y' : 'N';
			data.appendFile = wAppendFile.getValue() ? 'Y' : 'N';
			
			data.encoding = wEncoding.getValue();
			data.content = encodeURIComponent(wContent.getValue());
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
			labelWidth: 130,
			border: false,
			items: [{
				xtype: 'fieldset',
				title: '文件',
				items: [{
					xtype: 'compositefield',
					fieldLabel: '目录名',
					anchor: '-10',
					items: [wFilename, {
						xtype: 'button', text: '浏览...', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wFilename.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wCreateParentFolder, wAppendFile]
			}, {
				xtype: 'fieldset',
				title: '内容',
				items: [wEncoding, wContent]
			}]
		}];
		
		JobEntryWriteToFileDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('WRITE_TO_FILE', JobEntryWriteToFileDialog);