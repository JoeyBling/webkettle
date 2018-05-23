UniqueRowsDialog = Ext.extend(KettleDialog, {
	title: '去除重复记录',
	width: 600,
	height: 500,
	
	initComponent: function() {
		var me = this;
		
		var wCount = new Ext.form.Checkbox({fieldLabel: '增加计数器到输出'});
		var wRejectDuplicateRow = new Ext.form.Checkbox({fieldLabel: '重定向重复记录'});
		
		var wCountField = new Ext.form.TextField({fieldLabel: '计数器字段', anchor: '-10', disabled: true});
		var wErrorDesc = new Ext.form.TextField({fieldLabel: '错误描述', anchor: '-10', disabled: true});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'case_insensitive']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			UniqueRowsDialog.superclass.initData.apply(this, [cell]);
			
			wCount.setValue('Y' == cell.getAttribute('count_rows'));
			wCountField.setValue(cell.getAttribute('count_field'));
			wRejectDuplicateRow.setValue('Y' == cell.getAttribute('reject_duplicate_row'));
			wErrorDesc.setValue(cell.getAttribute('error_description'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.count_rows = wCount.getValue() ? 'Y' : 'N';
			data.count_field = wCountField.getValue();
			data.reject_duplicate_row = wRejectDuplicateRow.getValue() ? 'Y' : 'N';
			data.error_description = wErrorDesc.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		wCount.on('check', function(cb, checked) {
			if(checked === true)
				wCountField.enable();
			else
				wCountField.disable();
		});
		
		wRejectDuplicateRow.on('check', function(cb, checked) {
			if(checked === true)
				wErrorDesc.enable();
			else
				wErrorDesc.disable();
		});
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 150,
				border: false,
				margins: '0 0 5 0',
				bodyStyle: 'padding: 0px',
				items: [{
					xtype: 'fieldset',
					title: '设置',
					items: [wCount, wCountField, wRejectDuplicateRow, wErrorDesc]
				}]
			}, {
				title: '用来比较的字段',
				xtype: 'KettleEditorGrid',
				region: 'center',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取字段', scope: this, handler: function() {
							me.onSure(false);
							getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(s) {
								store.merge(s, ['name', {name: 'case_insensitive', value: 'N'}]);
							});
						}
					});
					
					menu.insert(1, '-');
				},
				getDefaultValue: function() {
					return {name: '', case_insensitive: 'N' };
				},
				columns: [new Ext.grid.RowNumberer(), {
					header: '字段名称', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputFields(cell.getAttribute('label'))
					})
				},{
					header: '忽略大小写', dataIndex: 'case_insensitive', width: 100, renderer: function(v)
					{
						if(v == 'N') 
							return '否'; 
						else if(v == 'Y') 
							return '是';
						return v;
					}, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: 'Y', text: '是'},
				        	       {value: 'N', text: '否'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				}],
				store: store
			}]
		};
		
		UniqueRowsDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('Unique', UniqueRowsDialog);