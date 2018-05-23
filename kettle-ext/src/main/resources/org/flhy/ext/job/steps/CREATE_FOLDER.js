JobEntryCreateFolderDialog = Ext.extend(KettleDialog, {
	title: '创建一个目录',
	width: 450,
	height: 170,
	initComponent: function() {
		var me = this;
		
		var wFoldername = new Ext.form.TextField({ flex: 1});
		var wAbortExists = new Ext.form.Checkbox({ fieldLabel: '如果目录存在则失败'});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryCreateFolderDialog.superclass.initData.apply(this, [cell]);
			
			wFoldername.setValue(cell.getAttribute('foldername'));
			wAbortExists.setValue('Y' == cell.getAttribute('fail_of_folder_exists'));
		};
		
		this.saveData = function(){
			var data = {};
			data.foldername = wFoldername.getValue();
			data.fail_of_folder_exists = wAbortExists.getValue() ? 'Y' : 'N';
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
			labelWidth: 130,
			items: [{
				xtype: 'compositefield',
				fieldLabel: '目录名',
				anchor: '-10',
				items: [wFoldername, {
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
		
		JobEntryCreateFolderDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('CREATE_FOLDER', JobEntryCreateFolderDialog);