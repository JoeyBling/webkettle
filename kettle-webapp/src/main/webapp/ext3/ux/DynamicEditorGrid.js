DynamicEditorGrid = function(config) {
	DynamicEditorGrid.superclass.constructor.call(this, config || {});
};

Ext.extend(DynamicEditorGrid, Ext.grid.EditorGridPanel, {
    initComponent: function(){
        var config = {
            enableColLock: false,
            loadMask: true,
            border: false,
            stripeRows: true,
            ds: new Ext.data.JsonStore({
                reader: new Ext.data.JsonReader()
            }),
            columns: []
        };
        Ext.apply(this, config);
        Ext.apply(this.initialConfig, config);
        DynamicEditorGrid.superclass.initComponent.apply(this, arguments);
    },
    onRender: function(ct, position){
        this.colModel.defaultSortable = true;
        DynamicEditorGrid.superclass.onRender.call(this, ct, position);
    },
    
    loadMetaAndValue: function(mv) {
    	var columns = [];
		var cols = mv.columns;
		columns.push(new Ext.grid.RowNumberer());
		for(var i=0, len=cols.length; i<len; i++) {
			columns.push(cols[i]);
		}
		this.getColumnModel().setConfig(columns);
		
		var store = this.getStore();
		var recordType = Ext.data.Record.create(mv.metaData.fields);
		store.reader = new Ext.data.JsonReader({}, recordType);
		
		store.loadData(mv);
    }
});

