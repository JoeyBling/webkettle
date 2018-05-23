TransLogTransPanel = Ext.extend(Ext.Panel, {
	defaults: {border: false},
	layout: {
        type:'vbox',
        align:'stretch'
    },
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), root = graph.getDefaultParent();
		var transLogTable = Ext.decode(root.getAttribute('transLogTable'));
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px 15px',
			height: 170,
			defaultType: 'textfield',
			labelWidth: 160,
			items: [{
				fieldLabel: '日志数据库连接',
				anchor: '-10'
			},{
				fieldLabel: '日志表模式',
				anchor: '-10'
			},{
				fieldLabel: '日志表',
				anchor: '-10'
			},{
				fieldLabel: '日志记录间隔时间(秒)',
				anchor: '-10'
			},{
				fieldLabel: '日志记录过时时间(天)',
				anchor: '-10'
			},{
				fieldLabel: '在内存中保存的日志行数限制',
				anchor: '-10'
			}]
		});
		
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			data: []
		}), data = [];
		var cells = graph.getModel().getChildCells(root, true, false);
		for(var j=0; j<cells.length; j++) {
			var cell = cells[j];
			if(cell.isVertex() && cell.isVisible()) {
				data.push({name: cell.getAttribute('label')});
			}
		}
		store.loadData(data);
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '日志字段',
			flex: 1,
			autoExpandColumn: 'columnDesc',
			columns: [{
				header: '启用', dataIndex: 'enabled', width: 60
			},{
				header: '字段名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '步骤名称', dataIndex: 'subject', width: 100, editor: new Ext.form.ComboBox({
			        store: store,
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				id: 'columnDesc', header: '字段描述', dataIndex: 'description', width: 100, editor: new Ext.form.TextField(), renderer: function(v) {
					return decodeURIComponent(v);
				}
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'subject', {name: 'subjectAllowed', type: 'boolean'}, 'description', {name: 'enabled', type: 'boolean'}],
				data: transLogTable.fields
			})
		});
		grid.on('beforeedit', function(e) {
			var rec = e.record;
			if(e.column == 2) {
				if(!rec.get('subjectAllowed')) {
					return false;
				}
			}
			return true;
		});
		
		this.items = [form, grid];
		TransLogTransPanel.superclass.initComponent.call(this);
	}

});

Ext.reg('TransLogTrans', TransLogTransPanel);