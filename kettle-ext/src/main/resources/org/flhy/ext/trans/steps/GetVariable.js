GetVariableDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "GetVariableDialog.DialogTitle"),
	width: 700,
	height: 500,
	bodyStyle: 'padding: 5px;',
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'variable', 'type', 'format', 'currency', 'decimal', 'group', 'length', 'precision', 'trim_type'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = this.fitItems = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: BaseMessages.getString(PKG, "GetVariableDialog.Fields.Label"),
			tbar: [{
				text: '新增字段', handler: function() {
	                var p = new store.recordType({ name: '', type: '', format: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段'
			},{
				text: '获取变量'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "GetVariableDialog.NameColumn.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "GetVariableDialog.VariableColumn.Column"), dataIndex: 'variable', width: 100, editor: new Ext.form.TextField()
			},{
				header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value'],
			        	data: [{value: 'yyyy-MM-dd HH:mm:ss'},
			        	       {value: 'yyyy/MM/dd HH:mm:ss'},
			        	       {value: 'yyyy-MM-dd'},
			        	       {value: 'yyyy/MM/dd'},
			        	       {value: 'yyyyMMdd'},
			        	       {value: 'yyyyMMddHHmmss'}]
			        }),
			        displayField:'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: '货币类型', dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: '小数', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: '分组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'nullif', width: 80, editor: new Ext.form.TextField()
			},{
				header: '去除空字符的方式', dataIndex: 'trim_type', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return '不去掉空格'; 
					else if(v == 'left') 
						return '去掉左空格';
					else if(v == 'right') 
						return '去掉右空格';
					else if(v == 'both') 
						return '去掉左右两端空格';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: '不去掉空格'},
			        	       {value: 'left', text: '去掉左空格'},
			        	       {value: 'right', text: '去掉右空格'},
			        	       {value: 'both', text: '去掉左右两端空格'}]
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
		
		this.getValues = function(){
			return {
				fields: Ext.encode(store.toJson())
			};
		};
		
		GetVariableDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('GetVariable', GetVariableDialog);