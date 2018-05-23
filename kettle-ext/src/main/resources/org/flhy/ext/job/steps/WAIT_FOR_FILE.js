JobEntryWaitForFileDialog = Ext.extend(KettleDialog, {
	title: '等待文件',
	width: 450,
	height: 300,
	initComponent: function() {
		var me = this;
		
		var wFilename = new Ext.form.TextField({flex: 1});
		var wMaximumTimeout = new Ext.form.TextField({fieldLabel: '超时', anchor: '-10'});
		var wCheckCycleTime = new Ext.form.TextField({fieldLabel: '循环检查的时间间隔', anchor: '-10'});
		
		var wSuccesOnTimeout = new Ext.form.Checkbox({ fieldLabel: '超时则成功'});
		var wFileSizeCheck = new Ext.form.Checkbox({ fieldLabel: '检查文件大小'});
		var wAddFilenameResult = new Ext.form.Checkbox({ fieldLabel: '添加文件名到结果'});

		this.initData = function() {
			var cell = this.getInitData();
			JobEntryWaitForFileDialog.superclass.initData.apply(this, [cell]);
			
			wFilename.setValue(cell.getAttribute('filename'));
			wMaximumTimeout.setValue(cell.getAttribute('maximum_timeout'));
			wCheckCycleTime.setValue(cell.getAttribute('check_cycle_time'));
			wSuccesOnTimeout.setValue('Y' == cell.getAttribute('success_on_timeout'));
			wFileSizeCheck.setValue('Y' == cell.getAttribute('file_size_check'));
			wAddFilenameResult.setValue('Y' == cell.getAttribute('add_filename_result'));
		};
		
		this.saveData = function(){
			var data = {};
			data.filename = wFilename.getValue();
			data.maximum_timeout = wMaximumTimeout.getValue();
			data.check_cycle_time = wCheckCycleTime.getValue();
			data.success_on_timeout = wSuccesOnTimeout.getValue() ? 'Y' : 'N';
			data.file_size_check = wFileSizeCheck.getValue() ? 'Y' : 'N';
			data.add_filename_result = wAddFilenameResult.getValue() ? 'Y' : 'N';
			
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
			}, wMaximumTimeout, wCheckCycleTime, wSuccesOnTimeout, wFileSizeCheck, wAddFilenameResult]
		}];
		
		JobEntryWaitForFileDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('WAIT_FOR_FILE', JobEntryWaitForFileDialog);