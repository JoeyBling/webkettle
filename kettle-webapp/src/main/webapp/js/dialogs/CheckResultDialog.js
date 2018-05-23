CheckResultDialog = Ext.extend(Ext.Window, {
	title: '转换检查结果',
	width: 500,
	height: 300,
	closeAction: 'close',
	layout: 'fit',
	modal: true,
	initComponent: function() {
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'typeDesc', 'text'],
			proxy: new Ext.data.HttpProxy({
			    url: GetUrl('trans/check.do'),
			    method: 'POST'
			})
		});
		
		store.baseParams.graphXml = getActiveGraph().toXml();
		store.baseParams.show_successful_results = false;	
		
		var checkbox = new Ext.form.Checkbox({
			boxLabel: '显示成功结果'
		});
		
		var grid = new Ext.grid.GridPanel({
			border: false,
			bbar: [checkbox],
			columns: [new Ext.grid.RowNumberer(), {
				header: '步骤名称', dataIndex: 'name', width: 130
			},{
				header: '结果', dataIndex: 'type', width: 80, renderer: function(v, m, r) {
					return v + ' - ' + r.get('typeDesc');
				}
			},{
				header: '备注', dataIndex: 'text', width: 240
			}],
			store: store,
			viewConfig: {
				getRowClass: function(rec, rowIndex, rp, ds) {
			        if(rec.get('type') == '1'){
			        	return '';
			        } else {
			            return 'expense-high';
			        }
			    }
	        }
		});
		
		this.items = grid;
		
		CheckResultDialog.superclass.initComponent.call(this);
		
		this.on('show', function() {
			store.load();
		});
		
		checkbox.on('check', function(cb, checkflag) {
			store.baseParams.show_successful_results = checkflag;
			store.load();
		});
	}
});