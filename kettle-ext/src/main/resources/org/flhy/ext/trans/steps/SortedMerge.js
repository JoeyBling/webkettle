SortedMergeDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "SortedMergeDialog.Shell.Title"),
	width: 400,
	height: 300,
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'ascending']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			SortedMergeDialog.superclass.initData.apply(this, [cell]);
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		
		this.fitItems = new KettleEditorGrid({
			title: BaseMessages.getString(PKG, "SortedMergeDialog.Fields.Label"),
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', scope: this, handler: function() {
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(s) {
							store.merge(s, ['name', {name: 'ascending', value: 'N'}]);
						});
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "SortedMergeDialog.Fieldname.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
			    })
			}, {
				header: BaseMessages.getString(PKG, "SortedMergeDialog.Ascending.Column"), dataIndex: 'ascending', width: 100, renderer: function(v)
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
		});
		
		
		SortedMergeDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SortedMerge', SortedMergeDialog);