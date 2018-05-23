JobEntryDelayDialog = Ext.extend(KettleDialog, {
	title: '等待',
	width: 350,
	height: 180,
	initComponent: function() {
		var wMaximumTimeout = new Ext.form.TextField({fieldLabel: '最大超时', anchor: '-10'});
		var wScaleTime = new Ext.form.ComboBox({
			fieldLabel: '单位',
			anchor: '-10',
			displayField: 'desc',
			valueField: 'code',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('timeunit2Store')
		});
		
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryDelayDialog.superclass.initData.apply(this, [cell]);
			
			wMaximumTimeout.setValue(cell.getAttribute('maximumTimeout'));
			wScaleTime.setValue(cell.getAttribute('scaletime'));
		};
		
		this.saveData = function(){
			var data = {};
			data.maximumTimeout = wMaximumTimeout.getValue();
			data.scaletime = wScaleTime.getValue();
			
			return data;
		};
		
		this.fitItems = [{
			xtype: 'KettleForm',
			labelWidth: 130,
			items: [wMaximumTimeout, wScaleTime]
		}];
		
		JobEntryDelayDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('DELAY', JobEntryDelayDialog);