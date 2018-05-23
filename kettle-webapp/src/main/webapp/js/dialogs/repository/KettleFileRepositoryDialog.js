KettleFileRepositoryDialog = Ext.extend(Ext.Window, {
	width: 400,
	height: 220,
	modal: true,
	title: '文件资源库设置',
	layout: 'fit',
	plain: true,
	
	initComponent: function() {
		this.addFlag = true;
		
		var wBaseDir = new Ext.form.TextField({flex: 1});
		var wReadOnly = new Ext.form.Checkbox({fieldLabel: '只读资源库？'});
		var wHidesHiddenFiles = new Ext.form.Checkbox({fieldLabel: '不显示隐藏文件'});
		var wId = new Ext.form.TextField({fieldLabel: '资源库标识', anchor: '-10'});
		var wName = new Ext.form.TextField({fieldLabel: '名称', anchor: '-10'});
		
		
		this.initData = function(meta) {
			this.addFlag = false;
			
			wId.setValue(meta.name);
			wName.setValue(meta.description);
			
			wBaseDir.setValue(meta.extraOptions.basedir);
			wReadOnly.setValue(meta.extraOptions.readOnly == 'Y');
			wHidesHiddenFiles.setValue(meta.extraOptions.hidingHidden == 'Y');
		};
		
		this.getValue = function() {
			var data = {};
			data.name = wId.getValue();
			data.description = wName.getValue();
			data.type = 'KettleFileRepository';
			data.extraOptions = {
					basedir: wBaseDir.getValue(),
					readOnly: wReadOnly.getValue() ? 'Y' : 'N',
					hidingHidden: wHidesHiddenFiles.getValue() ? 'Y' : 'N'
			};
			
			return data;
		};
		
		this.items = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 90,
			border: false,
			labelAlign: 'right',
			items: [{
				xtype: 'compositefield',
				fieldLabel: '根目录',
				anchor: '-10',
				items: [wBaseDir, {
					xtype: 'button', text: '浏览...', handler: function() {
						var dialog = new FileExplorerWindow();
						dialog.on('ok', function(path) {
							wBaseDir.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}, wReadOnly, wHidesHiddenFiles, wId, wName]
		});
		
		this.bbar = ['->', {
			text: '确定', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('repository/add.do'),
					method: 'POST',
					params: {reposityInfo: Ext.encode(this.getValue()), add: this.addFlag},
					scope: this,
					success: function(response) {
						var reply = Ext.decode(response.responseText);
						if(reply.success) {
							this.fireEvent('create', this);
						} else {
							Ext.Msg.alert(reply.title, reply.message);
						}
					}
			   });
			}
		}, {
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		}]
		
		KettleFileRepositoryDialog.superclass.initComponent.call(this);
		this.addEvents('create');
	}
});

Ext.reg('KettleFileRepository', KettleFileRepositoryDialog);