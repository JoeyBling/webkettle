EnterSelectionDialog = Ext.extend(Ext.Window, {
	title: '字段',
	width: 200,
	height: 300,
	closeAction: 'close',
	layout: 'fit',
	modal: true,
	
	valueField: 'name',
	displayField: 'name',
	
	initComponent: function() {
		if(this.initialConfig.dataUrl)
			this.dataUrl = this.initialConfig.dataUrl;
		else
			this.dataUrl = GetUrl('trans/inputOutputFields.do');
		
		var store = this.getStore(), me = this;
		
		
		var listView = new ListView({
			store: store,
			valueField: this.valueField,
			columns: [{
				dataIndex: this.valueField, hidden: true
			},{
				width: 1, dataIndex: this.displayField
			}]
		});
		
		this.items = {
				layout: 'fit',
				items: listView
		};
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				var value = listView.getValue();
				if(value) {
					me.fireEvent('sure', value);
					me.close();
				}
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		EnterSelectionDialog.superclass.initComponent.call(this);
		this.addEvents('sure');
	},
	
	getStore: function() {
		if(!this.store) {
			var fields = [this.valueField];
			if(this.valueField != this.displayField)
				fields.push(this.displayField);
			this.store = new Ext.data.JsonStore({
				fields: fields,
				proxy: new Ext.data.HttpProxy({
					url: this.dataUrl,
					method: 'POST'
				})
			});
		}
		return this.store;
	},
	
	load: function(bp) {
		this.store.baseParams = bp;
		this.store.load();
	}
});