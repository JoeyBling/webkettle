OptionsPanel = Ext.extend(Ext.grid.EditorGridPanel, {
	initComponent: function() {
		var me = this;
		
		var store = this.store = new Ext.data.JsonStore({
			fields: ['prefix', 'name', 'value'],
			data: []
		});
		
		this.tbar = [{
			text: '新增参数', handler: function() {
                var record = new store.recordType({name: '', value: ''});
                me.stopEditing();
                store.insert(0, record);
                me.startEditing(0, 0);
			}
		},{
			text: '删除参数', handler: function() {
				var sm = me.getSelectionModel();
				if(sm.hasSelection()) {
					store.removeAt(sm.getSelectedCell()[0]);
				}
			}
		}];
		this.columns= [new Ext.grid.RowNumberer(), {
			header: '命名参数', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
                allowBlank: false
            })
		},{
			header: '值', dataIndex: 'value', width: 200, editor: new Ext.form.TextField()
		}];
		OptionsPanel.superclass.initComponent.call(this);
	},
	
	initData: function(dbinfo) {
		this.store.loadData(dbinfo.extraOptions);
	},
	
	getValue: function(dbinfo) {
		var extraOptions = [];
		this.store.each(function(record) {
			extraOptions.push({name: record.get('name'), value: record.get('value')});
		});
		dbinfo.extraOptions = extraOptions;
	}
});