AppendDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "AppendDialog.Shell.Label"),
	width: 350,
	height: 180,
	initComponent: function() {
		var wHeadHop = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "AppendDialog.HeadHop.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		var wTailHop = new Ext.form.ComboBox({
			fieldLabel:  BaseMessages.getString(PKG, "AppendDialog.TailHop.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		this.initData = function() {
			var cell = this.getInitData();
			AppendDialog.superclass.initData.apply(this, [cell]);
			
			wHeadHop.setValue(cell.getAttribute('head_name'));
			wTailHop.setValue(cell.getAttribute('tail_name'));
		};
		
		this.saveData = function(){
			var data = {};
			data.head_name = wHeadHop.getValue();
			data.tail_name = wTailHop.getValue();
			
			return data;
		};
		
		this.fitItems = {
			border: false,
			items: [{
				xtype: 'KettleForm',
				labelWidth: 50,
				items: [wHeadHop, wTailHop]
			}]
		};
		
		AppendDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Append', AppendDialog);