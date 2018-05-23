TransDependenciesTab = Ext.extend(Ext.grid.EditorGridPanel, {
	title: '依赖',
	
	initComponent: function() {
		this.tbar = [{
			iconCls: 'add', scope: this, handler: function() {
				var RecordType = this.getStore().recordType;
	            var p = new RecordType({
	                name: '',
	                defa: '',
	                format: ''
	            });
	            this.stopEditing();
	            this.getStore().insert(0, p);
	            this.startEditing(0, 0);
			}
		},{
			iconCls: 'delete'
		}];
		
		this.columns = [new Ext.grid.RowNumberer(), {
			header: '数据库连接', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	            allowBlank: false
	        })
		},{
			header: '表', dataIndex: 'default_value', width: 100, editor: new Ext.form.TextField({
	            allowBlank: false
	        })
		},{
			header: '字段', dataIndex: 'description', width: 100, editor: new Ext.form.TextField({
	            allowBlank: false
	        })
		}];
		
		this.store = new Ext.data.JsonStore({
			fields: ['name', 'default_value', 'description'],
			data: []//Ext.decode(node.getAttribute('parameters') || Ext.encode([]))
		});
		
		TransDependenciesTab.superclass.initComponent.call(this);
	}
	
});