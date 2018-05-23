ValueMapperDialog = Ext.extend(KettleDialog, {
	title: '值映射',
	width: 400,
	height: 400,
	initComponent: function() {
		var me = this;
		
		var wFieldname = new Ext.form.ComboBox({
			fieldLabel: '使用的字段名',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label'))
	    });
		var wTargetFieldname = new Ext.form.TextField({fieldLabel: '目标字段名', anchor: '-10', emptyText: '空=覆盖'});
		var wNonMatchDefault = new Ext.form.TextField({fieldLabel: '不匹配时的默认值', anchor: '-10'});
		
		var store = new Ext.data.JsonStore({
			fields: ['source_value', 'target_value']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			ValueMapperDialog.superclass.initData.apply(this, [cell]);
			
			wFieldname.setValue(cell.getAttribute('field_to_use'));
			wTargetFieldname.setValue(cell.getAttribute('target_field'));
			wNonMatchDefault.setValue(cell.getAttribute('non_match_default'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.field_to_use = wFieldname.getValue();
			data.target_field = wTargetFieldname.getValue();
			data.non_match_default = wNonMatchDefault.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		var grid = new KettleEditorGrid({
			title: '字段值',
			region: 'center',
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: '源值', dataIndex: 'source_value', width: 100, editor: new Ext.form.TextField()
			},{
				header: '目标值', dataIndex: 'target_value', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 100,
					xtype: 'KettleForm',
					margins: '0 0 5 0',
					items: [wFieldname, wTargetFieldname, wNonMatchDefault]
				}, grid]
		};
		
		
		ValueMapperDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('ValueMapper', ValueMapperDialog);