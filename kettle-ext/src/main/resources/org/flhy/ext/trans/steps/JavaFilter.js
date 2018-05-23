JavaFilterDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "JavaFilter.Step.Description"),
	width: 600,
	height: 400,
	initComponent: function() {
		var wTrueTo = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "JavaFilterDialog.SendTrueTo.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label'))
		});
		var wFalseTo = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "JavaFilterDialog.SendFalseTo.Label"),
			anchor: '-10',
		    displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label'))
		});
		var wCondition = new Ext.form.TextArea({ fieldLabel: BaseMessages.getString(PKG, "JavaFIlterDialog.Condition.Label"), anchor: '-10', height: 200, autoScroll: true, emptyText: 'Java表达式' });
		
		this.initData = function() {
			var cell = this.getInitData();
			JavaFilterDialog.superclass.initData.apply(this, [cell]);
			
			wTrueTo.setValue(cell.getAttribute('send_true_to'));
			wFalseTo.setValue(cell.getAttribute('send_false_to'));
			if(!Ext.isEmpty(cell.getAttribute('condition')))
				wCondition.setValue(decodeURIComponent(cell.getAttribute('condition')));
		};
		
		this.saveData = function(){
			var data = {};
			data.send_true_to = wTrueTo.getValue();
			data.send_false_to = wFalseTo.getValue();
			data.condition = encodeURIComponent(wCondition.getValue());
			
			return data;
		};
		
		this.fitItems = new KettleForm({
			labelWidth: 120,
			bodyStyle: 'padding: 0px',
			border: false,
			items: [{
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "JavaFIlterDialog.Settings.Label"),
				items: [wTrueTo, wFalseTo, wCondition]
			}]
		});
		
		JavaFilterDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('JavaFilter', JavaFilterDialog);