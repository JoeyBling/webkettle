JobEntryFileExistsDialog = Ext.extend(KettleDialog, {
	width: 400,
	height: 155,
	title: '检查一个文件是否存在',
	initComponent: function() {
		
		var wFilename = new Ext.form.TextField({flex: 1});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryFileExistsDialog.superclass.initData.apply(this, [cell]);
			
			wFilename.setValue(cell.getAttribute('filename'));
		};
		
		this.saveData = function(){
			var data = {};
			data.filename = wFilename.getValue();
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
			items: [{
				xtype: 'compositefield',
				fieldLabel: '文件名',
				anchor: '-10',
				items: [wFilename, {
					xtype: 'button', text: '浏览...', handler: function() {
						var dialog = new FileExplorerWindow({extension: 24});
						dialog.on('ok', function(path) {
							wFilename.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}]
		}];
		JobEntryFileExistsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FILE_EXISTS', JobEntryFileExistsDialog);