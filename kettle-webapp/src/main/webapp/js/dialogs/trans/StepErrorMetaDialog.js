StepErrorMetaDialog = Ext.extend(Ext.Window, {
	title: '步骤错误处理设置',
	width: 550,
	height: 340,
	modal: true,
	layout: 'fit',
	iconCls: 'trans',
	defaults: {border: false},
	initComponent: function() {
		var cell = getActiveGraph().getGraph().getSelectionCell();
		var error = {};
		if(!Ext.isEmpty(cell.getAttribute('error')))
			error = Ext.decode(cell.getAttribute('error'));
		
		var wSourceStep = new Ext.form.TextField({fieldLabel: '错误处理步骤名', disabled: true, anchor: '-10', value: cell.getAttribute('label')});
		var wTargetStep = new Ext.form.ComboBox({
			fieldLabel: '目标步骤',
			anchor: '-10',
		    displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label')),
			value: error.target_step
		});
		var wEnabled = new Ext.form.Checkbox({fieldLabel: '启用错误处理', checked: 'Y' == error.is_enabled});
		
		var wNrErrors = new Ext.form.TextField({fieldLabel: '错误数列名', anchor: '-10', value: error.nr_valuename});
		var wErrDesc = new Ext.form.TextField({fieldLabel: '错误描述列名', anchor: '-10', value: error.descriptions_valuename});
		var wErrFields = new Ext.form.TextField({fieldLabel: '错误列的列名', anchor: '-10', value: error.fields_valuename});
		var wErrCodes = new Ext.form.TextField({fieldLabel: '错误编码列名', anchor: '-10', value: error.codes_valuename});
		var wMaxErrors = new Ext.form.TextField({fieldLabel: '允许的最大错误数', anchor: '-10', value: error.max_errors});
		var wMaxPct = new Ext.form.TextField({fieldLabel: '允许的最大错误百分比', anchor: '-10', value: error.max_pct_errors});
		var wMinPctRows = new Ext.form.TextField({fieldLabel: '在计算百分比前最少要读入的行数', anchor: '-10', value: error.min_pct_rows});
		
		this.items = [{
			xtype: 'KettleForm',
			labelWidth: 200,
			items: [wSourceStep, wTargetStep, wEnabled, wNrErrors, wErrDesc, wErrFields, wErrCodes, wMaxErrors, wMaxPct, wMinPctRows]
		}];
		
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {this.close()}
		}, {
			text: '确定', scope: this, handler: function() {
				var data = {};
				data.source_step = wSourceStep.getValue();
				data.target_step = wTargetStep.getValue();
				data.is_enabled = wEnabled.getValue() ? 'Y' : 'N';
				data.nr_valuename = wNrErrors.getValue();
				data.descriptions_valuename = wErrDesc.getValue();
				data.fields_valuename = wErrFields.getValue();
				data.codes_valuename = wErrCodes.getValue();
				data.max_errors = wMaxErrors.getValue();
				data.max_pct_errors = wMaxPct.getValue();
				data.min_pct_rows = wMinPctRows.getValue();
				
				this.fireEvent('ok', data);
			}
		}]
		
		StepErrorMetaDialog.superclass.initComponent.call(this);
		this.addEvents('ok');
	}
});