ConstantDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "ConstantDialog.DialogTitle"),
	width: 700,
	height: 500,
	bodyStyle: 'padding: 5px;',
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format', 'currency', 'decimal', 'group', 'nullif', 'length', 'precision', 'set_empty_string'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = this.fitItems = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: BaseMessages.getString(PKG, "ConstantDialog.Fields.Label"),
			tbar: [{
				text: '新增字段', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({ name: '', type: '', format: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段'
			},{
				text: '获取字段'
			},{
				text: '最小宽度'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "ConstantDialog.Name.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Type.Column"), dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "ConstantDialog.Format.Column"), dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "ConstantDialog.Length.Column"), dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Precision.Column"), dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Currency.Column"), dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Decimal.Column"), dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Group.Column"), dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Value.Column"), dataIndex: 'nullif', width: 80, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "ConstantDialog.Value.SetEmptyString"), dataIndex: 'set_empty_string', width: 100, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
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
		
		this.getValues = function(){
			return {
				fields: Ext.encode(store.toJson())
			};
		};
		
		ConstantDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Constant', ConstantDialog);