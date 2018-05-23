StepFieldsDialog = Ext.extend(Ext.Window, {
	width: 1000,
	height: 500,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		this.setTitle('步骤里的字段和其来源：' + cell.getAttribute('label'));
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('trans/inputOutputFields.do'),
				method: 'POST'
			})
		});
		
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(graph.getModel());
		
		store.baseParams.stepName = encodeURIComponent(cell.getAttribute('label'));
		store.baseParams.graphXml = mxUtils.getPrettyXml(node);
		store.baseParams.before = this.initialConfig.before;
		
		var grid = new Ext.grid.GridPanel({
			region: 'center',
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100
			},{
				header: '类型', dataIndex: 'type', width: 50
			},{
				header: '长度', dataIndex: 'length', width: 50
			},{
				header: '精度', dataIndex: 'precision', width: 50
			},{
				header: '步骤来源', dataIndex: 'origin', width: 100
			},{
				header: '存储', dataIndex: 'storageType', width: 100
			},{
				header: '掩码', dataIndex: 'conversionMask', width: 100
			},{
				header: '货币类型', dataIndex: 'currencySymbol', width: 100
			},{
				header: '小数', dataIndex: 'decimalSymbol', width: 100
			},{
				header: '分组', dataIndex: 'groupingSymbol', width: 100
			},{
				header: '设去除空格符', dataIndex: 'trimType', width: 80
			},{
				header: '注释', dataIndex: 'comments', width: 100
			}],
			store: store
		});
		
		this.items = grid;
		
		StepFieldsDialog.superclass.initComponent.call(this);
		
		this.on('show', function() {
			store.load();
		});
	}
});