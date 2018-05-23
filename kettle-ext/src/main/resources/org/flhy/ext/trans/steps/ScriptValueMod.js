ScriptValuesModDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "ScriptValuesDialogMod.Shell.Title"),
	width: 800,
	height: 550,
	bodyStyle: 'padding: 5px;',
	enterEnable: false,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		loadPluginScript('RowGenerator');
		
		var tree = new Ext.tree.TreePanel({
			title: BaseMessages.getString(PKG, "ScriptValuesDialogMod.JavascriptFunctions.Label"),
			region: 'west',
			width: 200,
			split: true,
			useArrows: true,
			root: new Ext.tree.TreeNode({text: 'root'}),
			enableDD:true,
			ddGroup:'JsWriteGroup',
			autoScroll: true,
			animate: false,
			rootVisible: false
		});
		
		var tabPanel = new Ext.TabPanel({
			region: 'center',
			plugins: new ScriptValueModMenu()
		});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'type', 'length', 'precision', 'replace']
		});
		
		this.initData = function() {
			ScriptValuesModDialog.superclass.initData.apply(this, [cell]);
			
			var cell = this.getInitData();
			var jsScripts = Ext.decode(cell.getAttribute('jsScripts'));
			Ext.each(jsScripts, function(js) {
				tabPanel.add({id: js.name, xtype: 'KettleEditor', title: js.name, closable: true, iconCls: 'activeScript', value: decodeURIComponent(js.value)});
			});
			if(jsScripts.length > 0)
				tabPanel.setActiveTab(0);
			store.loadData(Ext.decode(cell.getAttribute('fields')));
			
			var root = new Ext.tree.AsyncTreeNode({
	    		text: 'root',
				loader: new Ext.tree.TreeLoader({
					dataUrl: GetUrl('script/tree.do'),
					listeners: {
						beforeload: function(l) {
							l.baseParams.graphXml = getActiveGraph().toXml();
							l.baseParams.stepName = cell.getAttribute('label');
						},
						load: function(l, n) {
							n.firstChild.expand();
						}
					}
				})
	    	});
	    	tree.setRootNode(root);
		};
		
		this.saveData = function() {
			var data = {}, jsScripts = [];
			tabPanel.items.each(function(item) {
				var type = 0;
				if(item.iconCls == 'activeStartScript')
					type = 1;
				else if(item.iconCls == 'activeEndScript')
					type = 2;
				jsScripts.push({name: item.title, type: type, value: encodeURIComponent(item.getValue())});
			});
			data.jsScripts = Ext.encode(jsScripts);
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		tabPanel.on('tabchange', function(cp) {
			var node = tree.getNodeById('1');
			if(node) {
				node.eachChild(function(child) {
					if(!tabPanel.getComponent(child.text)) {
						child.remove(true);
					}
				});
			}
		});
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				region: 'center',
				border: false,
				layout: 'border',
				items: [tree, tabPanel]
			}, {
				region: 'south',
				height: 140,
				split: true,
				xtype: 'KettleEditorGrid',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.GetVariables.Button"), scope: this, handler: function() {
							me.onSure(false);
							var activeTab = tabPanel.getActiveTab();
							if(activeTab) {
								Ext.Ajax.request({
									url: GetUrl('script/getVariables.do'),
									params: {graphXml: getActiveGraph().toXml(), stepName: me.getStepname(), scriptName: activeTab.title},
									method: 'POST',
									success: function(response) {
										var data = Ext.decode(response.responseText);
										Ext.each(data, function(row) {
											store.insert(0, new store.recordType(row));
										});
									},
									failure: failureResponse
								});
							}
							
						}
					});
				},
				columns: [new Ext.grid.RowNumberer(), {
					header: BaseMessages.getString(PKG, "ScriptValuesDialogMod.ColumnInfo.Filename"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
				},{
					header: BaseMessages.getString(PKG, "ScriptValuesDialogMod.ColumnInfo.RenameTo"), dataIndex: 'rename', width: 100, editor: new Ext.form.TextField()
				},{
					header: BaseMessages.getString(PKG, "ScriptValuesDialogMod.ColumnInfo.Type"), dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
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
					header: BaseMessages.getString(PKG, "ScriptValuesDialogMod.ColumnInfo.Length"), dataIndex: 'length', width: 100, editor: new Ext.form.TextField()
				},{
					header: BaseMessages.getString(PKG, "ScriptValuesDialogMod.ColumnInfo.Precision"), dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
				},{
					header:  '替换\'FieldName\'或\'Rename to\'值', dataIndex: 'replace', width: 180, renderer: function(v)
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
			}]
		};
		
		ScriptValuesModDialog.superclass.initComponent.call(this);
	},
	
	initBottomBar: function(bar) {
		bar.insert(2, {
			text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.TestScript.Button"), scope: this, handler: function() {
				this.onSure(false);
				
				var stepName = this.getStepname();
				Ext.Ajax.request({
					url: GetUrl('script/testData.do'),
					params: {graphXml: getActiveGraph().toXml(), stepName: stepName},
					method: 'POST',
					success: function(response) {
						var doc = response.responseXML;
						var e = doc.documentElement;
						
						var dialog = new RowGeneratorDialog({value: e});
						dialog.onSure = function() {
							Ext.Ajax.request({
								url: GetUrl('script/test.do'),
								params: {graphXml: getActiveGraph().toXml(), stepName: stepName, rowGenerator: mxUtils.getXml(e)},
								method: 'POST',
								success: function(response) {
									var records = Ext.decode(response.responseText);
									
									var previewGrid = new DynamicEditorGrid({
										rowNumberer: true
									});
									
									var win = new Ext.Window({
										title: '预览数据',
										width: records.width,
										height: 500,
										layout: 'fit',
										items: previewGrid
									});
									win.show();
									
									previewGrid.loadMetaAndValue(records);
								},
								failure: failureResponse
							});
						};
						dialog.show();
					},
					failure: failureResponse
				});
			}
		})
	}
});

Ext.reg('ScriptValueMod', ScriptValuesModDialog);

ScriptValueModMenu = Ext.extend(Object, {
    constructor : function(config){
        Ext.apply(this, config || {});
    },

    //public
    init : function(tabs){
        this.tabs = tabs;
        tabs.on({
            scope: this,
            contextmenu: this.onContextMenu,
            destroy: this.destroy
        });
    },
    
    destroy : function(){
        Ext.destroy(this.menu);
        delete this.menu;
        delete this.tabs;
        delete this.active;    
    },

    // private
    onContextMenu : function(tabs, item, e){
        this.active = item;
        var m = this.createMenu();
        
        e.stopEvent();
        m.showAt(e.getPoint());
    },
    
    createMenu : function(){
    	var tabPanel = this.tabs;
        if(!this.menu){
            this.menu = new Ext.menu.Menu({
                items: [{
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.AddNewTab"), iconCls: 'addNew', handler: function() {
                		var i = 0, flag = true;
                		while(flag) {
                			flag = false;
                			tabPanel.items.each(function(item) {
                    			if(item.title == 'Item ' + i)
                    				flag = true;
                    		});
                			i++;
                		}
                		var name = 'Item ' + (i-1);
                		tabPanel.add({id: name, xtype: 'KettleEditor', title: name, closable: true, iconCls: 'activeScript'});
                	}
                }, {
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.AddCopy"), iconCls: 'addCopy'
                }, '-', {
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.SetTransformScript"), iconCls: 'activeScript', handler: function() {
                		var p = tabPanel.getActiveTab();
                		if(p) p.setIconClass('activeScript');
                	}
                }, {
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.SetStartScript"), iconCls: 'activeStartScript', handler: function() {
                		var p = tabPanel.getActiveTab();
                		if(p) p.setIconClass('activeStartScript');
                	}
                }, {
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.SetEndScript"), iconCls: 'activeEndScript', handler: function() {
                		var p = tabPanel.getActiveTab();
                		if(p) p.setIconClass('activeEndScript');
                	}
                }, '-', {
                	text: BaseMessages.getString(PKG, "ScriptValuesDialogMod.RemoveScriptType"), iconCls: 'scriptType'
                }]
            });
        }
        return this.menu;
    }
});