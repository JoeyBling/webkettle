CheckSumDialog = Ext.extend(KettleDialog, {
	width: 500,
	height: 450,
	title: BaseMessages.getString(PKG, "CheckSumDialog.Shell.Title" ),
	stepNameLabel:  BaseMessages.getString(PKG, "CheckSumDialog.Stepname.Label" ),
	initComponent: function() {
		var wType = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString( PKG, "CheckSumDialog.Type.Label" ),
			anchor: '-10',
			displayField: 'code',
			valueField: 'code',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('checksumTypeStore')
		});
		
		var wResultType = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString( PKG, "CheckSumDialog.ResultType.Label" ),
			anchor: '-10',
		    displayField: 'desc',
			valueField: 'code',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('checksumResulttypeStore'),
		    disabled: true
		});
		
		var wResult = new Ext.form.TextField({fieldLabel: BaseMessages.getString( PKG, "CheckSumDialog.Result.Label" ), anchor: '-10'});
		var wCompatibility = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString( PKG, "CheckSumDialog.CompatibilityMode.Label" ), disabled: true});
		
		var store = new Ext.data.JsonStore({
			fields: ['name']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			CheckSumDialog.superclass.initData.apply(this, [cell]);
			
			wType.setValue(cell.getAttribute('checksumtype'));
			wResultType.setValue(cell.getAttribute('resultType'));
			wResult.setValue(cell.getAttribute('resultfieldName'));
			wCompatibility.setValue(cell.getAttribute('compatibilityMode') == 'Y');
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.checksumtype = wType.getValue();
			data.resultType = wResultType.getValue();
			data.resultfieldName = wResult.getValue();
			data.compatibilityMode = wCompatibility.getValue() ? 'Y' : 'N';
			data.fields = Ext.encode(store.toJson());
			return data;
		};
		
		wType.on('select', function(cb, rec, index) {
			if(rec.get('code') == 'MD5' || rec.get('code') == 'SHA-1') {
				wResultType.enable();
			} else {
				wResultType.disable();
			}
		});
		
		wResultType.on('select', function(cb, rec, index) {
			if(rec.get('code') == 'hexadecimal') {
				wCompatibility.enable();
			} else {
				wCompatibility.disable();
			}
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 120,
					labelWidth: 150,
					xtype: 'KettleForm',
					margins: '0 0 5 0',
					items: [wType, wResultType, wResult, wCompatibility]
				}, {
					region: 'center',
					xtype: 'KettleEditorGrid',
					title: BaseMessages.getString( PKG, "CheckSumDialog.Fields.Label" ),
					columns: [new Ext.grid.RowNumberer(), {
						header: BaseMessages.getString( PKG, "CheckSumDialog.Fieldname.Column" ), dataIndex: 'name', width: 200, editor: new Ext.form.ComboBox({
							displayField: 'name',
							valueField: 'name',
							typeAhead: true,
					        forceSelection: true,
					        triggerAction: 'all',
					        selectOnFocus:true,
							store: getActiveGraph().inputFields(cell.getAttribute('label'))
						})
					}],
					store:store
				}]
		};
		CheckSumDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('CheckSum', CheckSumDialog);