JobEntryDeleteFileDialog = Ext.extend(KettleDialog, {
	title: '删除一个文件...',
	width: 450,
	height: 180,
	initComponent: function() {
		var me = this;
		
		var wFilename = new Ext.form.TextField({ flex: 1});
		var wAbortExists = new Ext.form.Checkbox({ fieldLabel: '如果文件不存在则失败'});

		this.initData = function() {
			var cell = this.getInitData();
			JobEntryDeleteFileDialog.superclass.initData.apply(this, [cell]);
			
			wFilename.setValue(cell.getAttribute('filename'));
			wAbortExists.setValue('Y' == cell.getAttribute('fail_if_file_exists'));
		};
		
		this.saveData = function(){
			var data = {};
			data.filename = wFilename.getValue();
			data.fail_if_file_exists = wAbortExists.getValue() ? 'Y' : 'N';
			
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
			}, wAbortExists]
		}];
		
		JobEntryDeleteFileDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('DELETE_FILE', JobEntryDeleteFileDialog);