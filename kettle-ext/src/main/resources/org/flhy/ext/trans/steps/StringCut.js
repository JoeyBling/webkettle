StringCutDialog = Ext.extend(KettleDialog, {
	title: '剪切字符串',
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['in_stream_name', 'out_stream_name', 'cut_from', 'cut_to']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			StringCutDialog.superclass.initData.apply(this, [cell]);
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		this.fitItems = new KettleEditorGrid({
			title: '要剪切的字段',
			xtype: 'KettleEditorGrid',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', scope: this, handler: function() {
						me.onSure(false);
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(s) {
							store.merge(s, [{name:'in_stream_name', field: 'name'}]);
						});
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '输入流字段', dataIndex: 'in_stream_name', width: 120, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
			    })
			},{
				header: '输出流字段', dataIndex: 'out_stream_name', width: 120, editor: new Ext.form.TextField()
			},{
				header: '起始位置', dataIndex: 'cut_from', width: 100, editor: new Ext.form.TextField()
			},{
				header: '结束位置', dataIndex: 'cut_to', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		StringCutDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('StringCut', StringCutDialog);