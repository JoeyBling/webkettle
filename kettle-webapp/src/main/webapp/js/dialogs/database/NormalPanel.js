NormalPanel = Ext.extend(Ext.Panel, {
	defaults: {border: false},
    layout: 'border',
	
	initComponent: function() {
		var connectionNameBox = new Ext.form.TextField({ fieldLabel: '连接名称', anchor: '-5' });
		var connectionBox = new ListView({
			valueField: 'value',
			store: Ext.StoreMgr.get('databaseAccessData'),
			columns: [{
				dataIndex: 'value', hidden: true
			},{
				width: 1, dataIndex: 'text'
			}]
		});	//connection type
		var accessBox = new ListView({
			valueField: 'value',
			store: Ext.StoreMgr.get('databaseAccessMethod'),
			columns: [{
				dataIndex: 'value', hidden: true
			},{
				width: 1, dataIndex: 'text'
			}]
		});	//connection method: jndi/jdbc/odbc...
		
		
		this.initData = function(dbinfo) {
			connectionNameBox.setValue(dbinfo.name);
			connectionBox.setValue(dbinfo.type);
			accessBox.setValue(dbinfo.access);
			this.dbinfo = dbinfo;
		};
		
		this.getValue = function() {
			var val = {
				name: connectionNameBox.getValue(),
				type: connectionBox.getValue(),
				access: accessBox.getValue()
			};
			Ext.apply(val, settingsForm.getForm().getValues());
			
			return val;
		};
		
		var fieldset = new Ext.form.FieldSet({
			title: '设置'
		});
		
		var settingsForm = new Ext.form.FormPanel({
			region: 'center',
			bodyStyle: 'padding: 0px 5px 5px 0px',
			labelWidth: 1,
			layout: 'fit',
			items: fieldset
		});
		
		connectionBox.on('selectionchange', function() {
			accessBox.getStore().baseParams.accessData = connectionBox.getValue();
			accessBox.getStore().load();
		});
		accessBox.getStore().on('load', function() {
			if(this.dbinfo.type == connectionBox.getValue()) {
				accessBox.setValue(this.dbinfo.access);
			}
		}, this);
		
		accessBox.on('selectionchange', function() {
			if(Ext.isEmpty(connectionBox.getValue()) || Ext.isEmpty(accessBox.getValue()))
				return;
			
			Ext.Ajax.request({
				url: GetUrl('database/accessSettings.do'),
				params: {accessData: connectionBox.getValue(), accessMethod: accessBox.getValue()},
				scope: this,
				success: function(response, opts) {
					var resObj = Ext.decode(response.responseText);
					
					fieldset.removeAll(true);
					fieldset.doLayout();
					
					Ext.each(Ext.decode(resObj.message), function(item) {
						fieldset.add(item);
					});
					fieldset.doLayout();
					
					settingsForm.getForm().setValues(this.dbinfo);
				},
				failure: failureResponse
			});
		}, this);
		
		this.items = [{
			xtype: 'KettleForm',
			labelWidth: 60,
			region: 'north',
			height: 40,
			items: connectionNameBox
		}, {
			defaults: {border: false},
			region: 'center',
			layout: 'border',
			items: [{
				region: 'west',
				width: 200,
				layout: 'border',
				margins: '7 5 5 8',
				items: [{
					title: '连接类型',
					region : 'center',
					layout: 'fit',
					items: connectionBox
				}, {
					title: '连接方式',
					region: 'south',
					height: 130,
					layout: 'fit',
					margins: '5 0 0 0',
					items: accessBox
				}]
			}, settingsForm]
		}];
		
		NormalPanel.superclass.initComponent.call(this);
	}
});