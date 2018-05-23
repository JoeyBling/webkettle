JobEntryDeleteFoldersDialog = Ext.extend(KettleDialog, {
	title: '删除目录',
	width: 600,
	height: 500,
	initComponent: function() {
		var me = this;
		
		var wPrevious = new Ext.form.Checkbox({fieldLabel: '保存上一步的结果到参数'})
		var wSuccessCondition =  new Ext.form.ComboBox({
			fieldLabel: '成功条件',
			anchor: '-10',
			displayField: 'desc',
			valueField: 'code',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('deleteFoldersSuccessConditionStore')
	    });
		var wLimitFolders = new Ext.form.TextField({fieldLabel: '数量', anchor: '-10', disabled: true});
		
		var store = new Ext.data.JsonStore({
			fields: ['field']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryDeleteFoldersDialog.superclass.initData.apply(this, [cell]);
			
			wPrevious.setValue('Y' == cell.getAttribute('arg_from_previous'));
			wSuccessCondition.setValue(cell.getAttribute('success_condition'));
			wLimitFolders.setValue(cell.getAttribute('limit_folders'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.arg_from_previous = wPrevious.getValue() ? 'Y' : 'N';
			data.success_condition = wSuccessCondition.getValue();
			data.limit_folders = wLimitFolders.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		wSuccessCondition.on('select', function(cb, rec) {
			if(rec.get('code') == 'success_when_at_least' || rec.get('code') == 'success_if_errors_less') {
				wLimitFolders.enable();
			} else {
				wLimitFolders.disable();
			}
		});
		
		var grid = new KettleEditorGrid({
			region: 'center',
			title: '待删除的文件夹',
			columns: [new Ext.grid.RowNumberer(), {
				header: '文件夹', dataIndex: 'field', width: 300, editor: new Ext.form.TextField()
			}, {
				header: '#', dataIndex: 'field', width: 100, renderer: function(v) {
					return '<a href="#">浏览...</a>';
				}
			}],
			store: store
		});
		
		grid.on('cellclick', function(g, row, col, e) {
			if(col == 2) {
				var dialog = new FileExplorerWindow();
				dialog.on('ok', function(path) {
					
					var rec = store.getAt(row);
					rec.set('field', path);
					store.commitChanges();
					
					dialog.close();
				});
				dialog.show();
			}
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 170,
					border: false,
					labelWidth: 140,
					bodyStyle: 'padding 0 5px',
					xtype: 'KettleForm',
					items: [{
						xtype: 'fieldset',
						title: '设置',
						items: [wPrevious]
					},{
						xtype: 'fieldset',
						title: '运行成功条件',
						items: [wSuccessCondition, wLimitFolders]
					}]
				}, grid]
		};
		
		
		JobEntryDeleteFoldersDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('DELETE_FOLDERS', JobEntryDeleteFoldersDialog);