JobEntryCreateFileDialog = Ext.extend(KettleDialog, {
	title: '创建文件',
	width: 450,
	height: 200,
	initComponent: function() {
		var me = this;
		
		var wFilename = new Ext.form.TextField({ flex: 1});
		var wAbortExists = new Ext.form.Checkbox({ fieldLabel: '如果文件存在则失败'});
		var wAddFilenameToResult = new Ext.form.Checkbox({ fieldLabel: '结果中添加文件名'});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryCreateFileDialog.superclass.initData.apply(this, [cell]);
			
			wFilename.setValue(cell.getAttribute('filename'));
			wAbortExists.setValue('Y' == cell.getAttribute('fail_if_file_exists'));
			wAddFilenameToResult.setValue('Y' == cell.getAttribute('addfilenameresult'));
		};
		
		this.saveData = function(){
			var data = {};
			data.filename = wFilename.getValue();
			data.fail_if_file_exists = wAbortExists.getValue() ? 'Y' : 'N';
			data.addfilenameresult = wAddFilenameToResult.getValue() ? 'Y' : 'N';
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
			labelWidth: 130,
			items: [{
				xtype: 'compositefield',
				fieldLabel: '文件名',
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
			}, wAbortExists, wAddFilenameToResult]
		}];
		
		JobEntryCreateFileDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('CREATE_FILE', JobEntryCreateFileDialog);