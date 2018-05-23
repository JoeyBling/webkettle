JoinRowsDialog = Ext.extend(KettleDialog, {
	title: 'Join Rows',
	width: 600,
	height: 400,
	initComponent: function() {
		var wSortDir = new Ext.form.TextField({flex: 1});
		var wPrefix = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JoinRowsDialog.TempFilePrefix.Label"), anchor: '-10'});
		var wCache = new Ext.form.NumberField({fieldLabel: '最大缓存大小', anchor: '-10'});
		var wMainStep = new Ext.form.ComboBox({
			fieldLabel: 'Main step to read from',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		var wCondition = new ConditionEditor({anchor: '-10', height: 170, autoScroll: true});
		
		this.initData = function() {
			var cell = this.getInitData();
			JoinRowsDialog.superclass.initData.apply(this, [cell]);
			
			wSortDir.setValue(cell.getAttribute('directory'));
			wPrefix.setValue(cell.getAttribute('prefix'));
			wCache.setValue(cell.getAttribute('cache_size'));
			wMainStep.setValue(cell.getAttribute('main'));
			wCondition.setValue(Ext.decode(cell.getAttribute('condition')));
		};
		
		this.saveData = function(){
			var data = {};
			data.directory = wSortDir.getValue();
			data.prefix = wPrefix.getValue();
			data.cache_size = wCache.getValue();
			data.main = wMainStep.getValue();
			data.condition = Ext.encode(wCondition.getValue());
			
			return data;
		};
		
		this.fitItems = new KettleForm({
			labelWidth: 140,
			bodyStyle: 'padding: 5px',
			items: [{
				xtype: 'compositefield',
				fieldLabel: BaseMessages.getString(PKG, "JoinRowsDialog.TempDir.Label"),
				anchor: '-10',
				items: [wSortDir, {
					xtype: 'button', text: BaseMessages.getString(PKG, "JoinRowsDialog.Browse.Button"), handler: function() {
						var dialog = new FileExplorerWindow();
						dialog.on('ok', function(path) {
							wSortDir.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}, wPrefix, wCache, wMainStep, wCondition]
		});
		
		JoinRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('JoinRows', JoinRowsDialog);