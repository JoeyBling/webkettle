WriteToLogDialog = Ext.extend(KettleDialog, {
	title: '写日志',
	width: 400,
	height: 500,
	initComponent: function() {
		var me = this;
		
		var wLoglevel = new Ext.form.ComboBox({
			fieldLabel: '日志级别',
			displayField: 'desc',
			valueField: 'code',
			anchor: '-10',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('logLevelStore')
		});
		var wPrintHeader = new Ext.form.Checkbox({fieldLabel: '打印头'});
		var wLimitRows = new Ext.form.Checkbox({fieldLabel: '限制行数'});
		var wLimitRowsNumber = new Ext.form.NumberField({fieldLabel: '限制行数数值', anchor: '-10', disabled: true});
		var wLogMessage = new Ext.form.TextArea({fieldLabel: '写日志', anchor: '-10', height: 80});
		
		var store = new Ext.data.JsonStore({
			fields: ['name']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			WriteToLogDialog.superclass.initData.apply(this, [cell]);
			
			wLoglevel.setValue(cell.getAttribute('loglevel'));
			wPrintHeader.setValue(cell.getAttribute('displayHeader') == 'Y');
			wLimitRows.setValue(cell.getAttribute('limitRows') == 'Y');
			wLimitRowsNumber.setValue(cell.getAttribute('limitRowsNumber'));
			if(!Ext.isEmpty(cell.getAttribute('logmessage')))
				wLogMessage.setValue(decodeURIComponent(cell.getAttribute('logmessage')));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.loglevel = wLoglevel.getValue();
			data.displayHeader = wPrintHeader.getValue() ? 'Y' : 'N';
			data.limitRows = wLimitRows.getValue() ? 'Y' : 'N';
			data.limitRowsNumber = wLimitRowsNumber.getValue();
			data.logmessage = encodeURIComponent(wLogMessage.getValue());
			data.fields = Ext.encode(store.toJson());
			return data;
		};
		
		var grid = new KettleEditorGrid({
			title: '字段',
			region: 'center',
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段', dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 210,
					xtype: 'KettleForm',
					margins: '0 0 5 0',
					items: [wLoglevel, wPrintHeader, wLimitRows, wLimitRowsNumber, wLogMessage]
				}, grid]
		};
		
		wLimitRows.on('check', function(cb, checked) {
			if(checked === true) {
				wLimitRowsNumber.enable();
			} else {
				wLimitRowsNumber.disable();
			}
		});
		
		WriteToLogDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('WriteToLog', WriteToLogDialog);
