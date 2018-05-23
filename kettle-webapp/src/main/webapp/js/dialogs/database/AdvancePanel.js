AdvancePanel = Ext.extend(Ext.form.FormPanel, {
	labelWidth: 1,
	initComponent: function() {
		var checkboxGroup = this.checkboxGroup = new Ext.form.CheckboxGroup({
			columns: 1,
            itemCls: 'x-check-group-clt',
            anchor: '-5',
            items: [
                {boxLabel: '支持布尔数据类型', name: 'supportBooleanDataType'},
                {boxLabel: '支持Timestamp数据类型', name: 'supportTimestampDataType'},
                {boxLabel: '标识符使用引号括起来', name: 'quoteIdentifiersCheck'},
                {boxLabel: '强制标识符使用小写字母', name: 'lowerCaseIdentifiersCheck'},
                {boxLabel: '强制标识符使用大写字母', name: 'upperCaseIdentifiersCheck'},
                {boxLabel: 'Preserve case of reserved words', name: 'preserveReservedCaseCheck'}
            ]
		});
		
		var textfield = this.textfield = new Ext.form.TextField({
			anchor: '0',
        	name: 'preferredSchemaName'
		});
		
		var textArea = this.textArea = new Ext.form.TextArea({
			anchor: '0',
        	name: 'connectSQL'
		});
		
		this.items = [{
			xtype: 'fieldset',
			anchor: '0',
			style: 'height: 100%;padding: 5px',
			items: [checkboxGroup , {
            	xtype: 'label',
            	style: 'line-height:25px; padding-left: 5px',
            	text: '默认模式名称.在没有其他模式名时使用'
            }, textfield, {
            	xtype: 'label',
            	style: 'line-height:25px; padding-left: 5px',
            	text: '请输入连接成功后要执行的SQL语句，用分号(;)隔开'
            }, textArea]
		}];
		AdvancePanel.superclass.initComponent.call(this);
	},
	
	initData: function(dbinfo) {
		this.checkboxGroup.setValue(dbinfo);
		this.textfield.setValue(dbinfo.preferredSchemaName);
		if(dbinfo.connectSQL) 
			this.textArea.setValue(decodeURIComponent(dbinfo.connectSQL));
	},
	
	getValue: function(dbinfo) {
		Ext.each(this.checkboxGroup.getValue(), function(item) {
			dbinfo[item.name] = true;
		});
		if(!Ext.isEmpty(this.textfield.getValue()))
			dbinfo.preferredSchemaName = this.textfield.getValue();
		if(!Ext.isEmpty(this.textArea.getValue()))
			dbinfo.connectSQL = encodeURIComponent(this.textArea.getValue());
	}
});