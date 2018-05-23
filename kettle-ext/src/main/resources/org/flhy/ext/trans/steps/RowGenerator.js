RowGeneratorDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "RowGeneratorDialog.DialogTitle"),
	width: 700,
	height: 500,
	initComponent: function() {
		var wLimit = new Ext.form.TextField({ fieldLabel: BaseMessages.getString(PKG, "RowGeneratorDialog.Limit.Label"), anchor: '-10' });
		var wNeverEnding = new Ext.form.Checkbox({ fieldLabel: 'Never stop generating rows' });
		var wInterval = new Ext.form.TextField({ fieldLabel: 'Interval in ms(delay)', anchor: '-10', disabled: true });
		var wRowTimeField = new Ext.form.TextField({ fieldLabel: 'Current row time field name', anchor: '-10', disabled: true });
		var wLastTimeField = new Ext.form.TextField({ fieldLabel: 'Previous row time field name', anchor: '-10', disabled: true });
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format', 'length', 'precision', 'currencyType', 'decimal', 'group', 'value', {name:'nullable', type:'boolean'}]
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			RowGeneratorDialog.superclass.initData.apply(this, [cell]);
			
			wLimit.setValue(cell.getAttribute('rowLimit'));
			wNeverEnding.setValue('Y' == cell.getAttribute('neverEnding'));
			wInterval.setValue(cell.getAttribute('intervalInMs'));
			wRowTimeField.setValue(cell.getAttribute('rowTimeField'));
			wLastTimeField.setValue(cell.getAttribute('lastTimeField'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.rowLimit = wLimit.getValue();
			data.neverEnding = wNeverEnding.getValue() ? 'Y' : 'N';
			data.intervalInMs = wInterval.getValue();
			data.rowTimeField = wRowTimeField.getValue();
			data.lastTimeField = wLastTimeField.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		wNeverEnding.on('check', function(cb, checked) {
			if(checked) {
				wInterval.enable();
				wRowTimeField.enable();
				wLastTimeField.enable();
			} else {
				wInterval.disable();
				wRowTimeField.disable();
				wLastTimeField.disable();
			}
		});
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				region: 'north',
				xtype: 'KettleForm',
				height: 150,
				labelWidth: 185,
				items: [wLimit, wNeverEnding, wInterval, wRowTimeField, wLastTimeField]
			}, {
				region: 'center',
				title: BaseMessages.getString(PKG, "RowGeneratorDialog.Fields.Label"),
				xtype: 'KettleEditorGrid',
				columns: [new Ext.grid.RowNumberer(), {
					header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
		                allowBlank: false
		            })
				},{
					header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
				        store: Ext.StoreMgr.get('valueMetaStore'),
				        displayField: 'name',
				        valueField: 'name',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				},{
					header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
				        store: Ext.StoreMgr.get('valueFormatStore'),
				        displayField:'name',
				        valueField:'name',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				},{
					header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
				},{
					header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
				},{
					header: '货币类型', dataIndex: 'currencyType', width: 100, editor: new Ext.form.TextField()
				},{
					header: '小数', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
				},{
					header: '分组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
				},{
					header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
				},{
					header: BaseMessages.getString(PKG, "System.Column.SetEmptyString"), dataIndex: 'nullable', xtype: 'checkcolumn', width: 80
				}],
				store: store
			}]
		};
		
		RowGeneratorDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('RowGenerator', RowGeneratorDialog);