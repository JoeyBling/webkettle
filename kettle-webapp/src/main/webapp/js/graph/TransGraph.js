EnterPreviewRowsDialog = Ext.extend(Ext.Window, {
    title: '请选择需要预览的步骤',
    width: 400,
    height: 300,
    layout: 'fit',
    modal: true,
    initComponent: function() {
        var store = new Ext.data.JsonStore({
            fields: ['name', 'metaData', 'columns', 'firstRecords']
        });

        var stepsList = new ListView({
            valueField: 'name',
            store: store,
            columns: [{
                dataIndex: 'name', value: 200
            }]
        });

        this.items = {
            border: false,
            layout: 'fit',
            bodyStyle: 'padding: 10px',
            items: {
                border: false,
                layout: 'border',
                items: [{
                    xtype: 'label',
                    text: '预览步骤：',
                    height: 30,
                    region: 'north'
                }, {
                    region: 'center',
                    layout: 'fit',
                    items: stepsList
                }]
            }
        };

        this.bbar = ['->', {
            text: '显示', scope: this, handler: function() {
                var records = stepsList.getSelectedRecords();
                if(records.length > 0) {
                    var previewGrid = new DynamicEditorGrid({
                        rowNumberer: true
                    });

                    var win = new Ext.Window({
                        title: '预览数据',
                        width: 850,
                        height: 500,
                        layout: 'fit',
                        bbar: ['->', {
                            text: '关闭', handler: function() {
                                win.close();
                            }
                        }],
                        items: previewGrid
                    });
                    win.show();

                    previewGrid.loadMetaAndValue(records[0].json);
                } else {
                    alert('请选择您要预览的步骤！');
                }
            }
        }, {
            text: '关闭', scope: this, handler: function() {
                this.close();
            }
        }];

        this.initData = function(steps) {
            store.loadData(steps);

            if(steps.length == 1) {
                var previewGrid = new DynamicEditorGrid({
                    rowNumberer: true
                });

                var win = new Ext.Window({
                    title: '预览数据',
                    width: 850,
                    height: 500,
                    layout: 'fit',
                    bbar: ['->', {
                        text: '关闭', handler: function() {
                            win.close();
                        }
                    }],
                    items: previewGrid
                });
                win.show();

                previewGrid.loadMetaAndValue(steps[0]);
            }
        };

        EnterPreviewRowsDialog.superclass.initComponent.call(this);
    }
});

TransExecutor = Ext.extend(Ext.util.Observable, {

    executionId: null,
    debuging: false,

    constructor: function() {
        this.addEvents('beforerun', 'run', 'debug', 'result', 'stop', 'finish');

        this.on('run', function(executionId) {
            this.executionId = executionId;
            this.loadResult();
        }, this);

        this.on('debug', function(executionId) {
            this.executionId = executionId;
            this.debuging = true;
            this.loadDebugResult('askformore');
        }, this);

        this.on('stop', function(result) {
            this.executionId = null;
            this.fireEvent('result', result);
            this.fireEvent('finish');
        }, this);

        this.on('finish', function(result, debug) {
            if(debug === true && result.lastPreviewResults.length > 0) {
                var dialog = new EnterPreviewRowsDialog();
                dialog.show(null, function() {
                    dialog.initData(result.lastPreviewResults);
                });
            }

            this.debuging = false;
        }, this);

    },

    loadResult: function() {
        var me = this;
        Ext.Ajax.request({
            url: GetUrl('trans/result.do'),
            params: {executionId: this.executionId},
            method: 'POST',
            success: function(response) {
                var result = Ext.decode(response.responseText);

                me.fireEvent('result', result);
                if(!result.finished) {
                    setTimeout(function() { me.loadResult(); }, 100);
                } else {
                    me.fireEvent('finish', result, false);
                    me.executionId = null;
                }
            },
            failure: failureResponse
        });
    },

    loadDebugResult: function(action) {
        var me = this;
        Ext.Ajax.request({
            url: GetUrl('trans/previewResult.do'),
            params: {executionId: this.executionId, action: action},
            method: 'POST',
            success: function(response) {
                var result = Ext.decode(response.responseText);
                if(action == 'stop') {
                    me.fireEvent('stop', result);
                    return;
                }

                me.fireEvent('result', result);
                if(!result.finished) {
                    var previewGrid = new DynamicEditorGrid({
                        rowNumberer: true
                    });

                    var win = new Ext.Window({
                        title: '预览数据',
                        width: 850,
                        height: 500,
                        layout: 'fit',
                        bbar: ['->', {
                            text: '关闭', handler: function() {
                                win.close();
                            }
                        }, {
                            text: '停止', handler: function() {
                                win.close();
                                me.loadDebugResult('stop');
                            }
                        }, {
                            text: '获取更多行', handler: function() {
                                win.close();
                                me.loadDebugResult('askformore');
                            }
                        }],
                        items: previewGrid
                    });
                    win.show();

                    previewGrid.loadMetaAndValue(result.previewData);

                } else {
                    me.executionId = null;
                    me.fireEvent('finish', result, true);
                }

            },
            failure: failureResponse
        });
    },

    isRunning: function() {
        return this.executionId != null;
    },

    isDebuging: function() {
        return this.isRunning() && this.debuging;
    },

    stop: function() {
        var me = this;
        if(this.executionId == null)
            return;

        Ext.Ajax.request({
            url: GetUrl('trans/stop.do'),
            method: 'POST',
            params: {executionId: this.executionId},
            success: function(response) {
                if(response.responseText=="faile"){
                    Ext.MessageBox.alert("该转换为远程执行,请在任务监控模块进行停止!");
                }else{
                    var resObj = Ext.decode(response.responseText);
                    me.fireEvent('stop', resObj);
                }
            },
            failure: failureResponse
        });
    },

    pause: function() {
        var me = this;
        if(this.executionId == null)
            return;

        Ext.Ajax.request({
            url: GetUrl('trans/pause.do'),
            method: 'POST',
            params: {executionId: this.executionId},
            success: function(response) {
                var result=response.responseText;
                if(result!="success"){
                    Ext.MessageBox.alert("该转换为远程执行,请在任务监控模块进行暂停/开始操作");
                }
            },
            failure: failureResponse
        });
    }
});

StatusPanel = Ext.extend(Ext.BoxComponent, {

    tpl: new Ext.Template([
        '<table class="pd_body" cellspacing="0" cellpadding="0">',
        '<tr class="sep">',
        '<td>复制的记录行数</td>',
        '<td align="right">{num}</td>',
        '</tr>',
        '<tr>',
        '<td>读</td>',
        '<td align="right">{r}</td>',
        '</tr>',
        '<tr class="sep">',
        '<td>写</td>',
        '<td align="right">{x}</td>',
        '</tr>',
        '<tr>',
        '<td>输入</td>',
        '<td align="right">{i}</td>',
        '</tr>',
        '<tr class="sep">',
        '<td>输出</td>',
        '<td align="right">{o}</td>',
        '</tr>',
        '<tr>',
        '<td>更新</td>',
        '<td align="right">{u}</td>',
        '</tr>',
        '<tr class="sep">',
        '<td>拒绝</td>',
        '<td align="right">{f}</td>',
        '</tr>',
        '<tr>',
        '<td>错误</td>',
        '<td align="right">{e}</td>',
        '</tr>',
        '<tr class="sep">',
        '<td>激活</td>',
        '<td align="right">{a}</td>',
        '</tr>',
        '<tr>',
        '<td>时间</td>',
        '<td align="right">{t}</td>',
        '</tr>',
        '<tr class="sep">',
        '<td>速度(条记录/秒)</td>',
        '<td align="right">{s}</td>',
        '</tr>',
        '<tr>',
        '<td>Pri/in/out</td>',
        '<td align="right">{pio}</td>',
        '</tr>',
        '</table>']),

    onRender: function(ct, pos) {
        StatusPanel.superclass.onRender.call(this, ct, pos);
        this.tpl.append(this.el, this.value || {});
    },

    setValue: function(val) {
        this.value = val;
        this.tpl.overwrite(this.el, val);
    }
});

TransGraph = Ext.extend(BaseGraph, {
    iconCls: 'trans',
    initComponent: function() {
        var resultPanel = new TransResult({hidden: !this.showResult});
        this.items = [resultPanel];

        if(this.readOnly === false) {
            var transExecutor = this.transExecutor = new TransExecutor();
            transExecutor.on('beforerun', function(executor, defaultExecutionConfig) {
                var dialog = new TransExecutionConfigurationDialog();
                dialog.show(null, function() {
                    dialog.initData(defaultExecutionConfig);
                });
            });
            transExecutor.on('result', this.doResult, this);

//			this.on('initgraph', function(graph) {
//				graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt){
//					if(transExecutor.isDebuging()) {
//						Ext.each(evt.getProperty('added'), function(cell) {
//
//							var doc = mxUtils.createXmlDocument();
//							var di = doc.createElement('DebugInfo');
//							di.setAttribute('label', '<div id="DebugInfo' + cell.getId() + '"></div>');
//
//							var nc = graph.insertVertex(graph.getDefaultParent(), null, di, 1, 1, 200, 230);
//
//							new StatusPanel({
//								renderTo: Ext.get('DebugInfo' + cell.getId()),
//								width: 180
//							});
//
//
//						});
//
//						Ext.each(evt.getProperty('removed'), function(cell) {
//
//						});
//					}
//				});
//			});

            var startrun = function() {
                var tb = this.getTopToolbar();
                tb.find('iconCls', 'pause')[0].enable();
                tb.find('iconCls', 'stop')[0].enable();
            };
            transExecutor.on('run', startrun, this);
            transExecutor.on('debug', startrun, this);

            var finish = function() {
                var tb = this.getTopToolbar();
                tb.find('iconCls', 'pause')[0].disable();
                tb.find('iconCls', 'stop')[0].disable();
            };
            transExecutor.on('finish', finish, this);
        }

        if(this.Executable==false && this.readOnly==false){
            this.tbar = [{
                iconCls: 'save', scope: this, tooltip: '保存这个转换', handler: this.save
            }, '-', {
                iconCls: 'run', scope: this, tooltip: '运行这个转换', handler: this.run
            }, {
                iconCls: 'pause', scope: this, disabled: true, tooltip: '恢复/暂停这个转换', handler: this.pause
            }, {
                iconCls: 'stop', scope: this, disabled: true, tooltip: '停止这个转换', handler: this.stop
            }, {
                iconCls: 'preview', scope: this, tooltip: '预览这个转换', handler: this.preview
            }, {
                iconCls: 'debug', scope: this, tooltip: '调试这个转换', handler: this.debug
            }, '-', {
                iconCls: 'check', scope: this, tooltip: '校验这个转换', handler: this.check
            }, {
                iconCls: 'SQLbutton', scope: this, tooltip: '产生需要运行这个转换的SQL', handler: this.getSQL
            }, '-', /*{
                iconCls: 'SlaveServer', scope: this, handler: this.showSlaves
            }, */{
                iconCls: 'ClusterSchema', scope: this, handler: this.clusterSchema
            }, {
                iconCls: 'PartitionSchema', scope: this, handler: this.partitionSchema
            }, '-', {
                iconCls: 'show-results', scope: this, handler: this.showResultPanel
            },{
                iconCls: 'databasesCls', scope: this, handler: this.databaseConn,tooltip: '数据库连接'
            },{
                iconCls: 'show-results', scope: this, handler: this.showHoopCluster
            }];
        }else if(this.Executable==true && this.readOnly==false){
            this.tbar = [{
                iconCls: 'run', scope: this, tooltip: '运行这个转换', handler: this.run
            }, {
                iconCls: 'pause', scope: this, disabled: true, tooltip: '恢复/暂停这个转换', handler: this.pause
            }, {
                iconCls: 'stop', scope: this, disabled: true, tooltip: '停止这个转换', handler: this.stop
            }];
        }

        TransGraph.superclass.initComponent.call(this);

        this.on('load', function() {
            var graph = this.getGraph();
            var root = graph.getDefaultParent();
            Ext.each(graph.getChildCells(root, true, false), function(cell) {
                this.showPartitioning(cell);

                if(cell.getAttribute('cluster_schema')) {
                    this.showCluster(cell);
                }
            }, this);

            var exist = function(name, inc) {
                var cells = graph.getChildCells(graph.getDefaultParent(), true, false);
                for(var i=0; i<cells.length; i++)
                    if(cells[i].getAttribute('label') == name && inc != 1)
                        return true;

                return false;
            };

            graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt){
                var cells = evt.getProperty('cells');
                Ext.each(cells, function(cell) {
                    if(cell.isVertex() && cell.value) {
                        var name = cell.getAttribute('label'), inc = 1;
                        do {
                            if(exist(name, inc) === false) {
                                cell.setAttribute('label', name);
                                break;
                            } else
                                inc++;
                            name = cell.getAttribute('label') + inc;
                        } while(true)
                    }
                });
            });

            var me = this;
            graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){
                Ext.each(evt.getProperty('edit').changes, function(change) {
                    if (change.constructor == mxCellAttributeChange && change.cell != null)    {
                        var cell = change.cell, root = graph.getDefaultParent();
                        if(cell.getId() == root.getId()) {
                            me.getClusterSchemaStore();
                            me.getPartitionSchemaStore();
                        }
                    }
                });
            });

        }, this);
    },

    doResult: function(result) {
        var resultPanel = this.layout.south.panel;
        resultPanel.loadLocal(result);
        this.updateStatus(result.stepStatus);
    },

    toRun: function(executionId) {
        var resultPanel = this.layout.south.panel;
        if(!resultPanel.isVisible())
            this.showResultPanel();

        this.transExecutor.fireEvent('run', executionId);
    },

    toDebug: function(executionId) {
        var resultPanel = this.layout.south.panel;
        if(!resultPanel.isVisible())
            this.showResultPanel();

        this.transExecutor.fireEvent('debug', executionId);
    },

    /***
     * toolbar func
     *
     */
    save: function() {
        Ext.getBody().mask('正在保存，请稍后...', 'x-mask-loading');
        Ext.Ajax.request({
            url: GetUrl('trans/save.do'),
            params: {graphXml: encodeURIComponent(this.toXml())},
            method: 'POST',
            success: function(response) {
                try{
                    decodeResponse(response, function(resObj) {
                        Ext.Msg.show({
                            title: '系统提示',
                            msg: resObj.message,
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    });
                }finally{
                    Ext.getBody().unmask();
                }
            },
            failure: failureResponse
        });
    },

    run: function() {
        var transExecutor = this.transExecutor;
        if(transExecutor.isRunning()) {
            Ext.Msg.alert('系统提示', '转换正在执行，请稍后...');
            return;
        }

        var graphXml=this.toXml();
        if(this.Executable || this.readOnly){
            Ext.Ajax.request({
                url: GetUrl('trans/initRun.do'),
                method: 'POST',
                params: {graphXml: graphXml},
                success: function(response) {
                    var resObj = Ext.decode(response.responseText);
                    transExecutor.fireEvent('beforerun', transExecutor, resObj);
                },
                failure: failureResponse
            });
        }else{
            Ext.getBody().mask('正在保存，请稍后...', 'x-mask-loading');
            Ext.Ajax.request({
                url: GetUrl('trans/save.do'),
                params: {graphXml: encodeURIComponent(graphXml)},
                method: 'POST',
                success: function(response) {
                    var resp=response;
                    try{
                        Ext.Ajax.request({
                            url: GetUrl('trans/initRun.do'),
                            method: 'POST',
                            params: {graphXml: graphXml},
                            success: function(response) {
                                var resObj = Ext.decode(response.responseText);
                                transExecutor.fireEvent('beforerun', transExecutor, resObj);
                                decodeResponse(resp, function(resObj) {
                                    Ext.Msg.show({
                                        title: '系统提示',
                                        msg: resObj.message,
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.MessageBox.INFO
                                    });
                                });
                            },
                            failure: failureResponse
                        });
                    }finally{
                        Ext.getBody().unmask();
                    }
                },
                failure: failureResponse
            });
        }
    },

    pause: function() {
        this.transExecutor.pause();
    },

    stop: function() {
        this.transExecutor.stop();
    },

    preview: function() {
        var selectedCells = [], graph = this.getGraph();
        Ext.each(graph.getSelectionCells(), function(c) {
            if(c.isVertex() && c.value)
                selectedCells.push(c.getAttribute('label'));
        });

        Ext.Ajax.request({
            url: GetUrl('trans/initPreview.do'),
            params: {graphXml: this.toXml(), selectedCells: encodeURIComponent(Ext.encode(selectedCells))},
            method: 'POST',
            success: function(response) {
                var jsonArray = Ext.decode(response.responseText);
                var win = new TransDebugDialog();
                win.show(null, function() {
                    win.initData(jsonArray);
                });
            },
            failure: failureResponse
        });
    },

    debug: function() {

    },

    check: function() {
        var checkResultDialog = new CheckResultDialog();
        checkResultDialog.show();
    },

    getSQL: function() {
        var dialog = new SQLStatementsDialog({sqlUrl: this.sqlUrl});
        dialog.show();
    },

    showResultPanel: function() {
        var resultPanel = this.layout.south.panel;

        resultPanel.setVisible( !resultPanel.isVisible() );
        this.doLayout();
    },
    showHoopCluster:function(){
        var hadoopClusterGrid=new HadoopClusterGrid();
        var carteInfoWindow=new Ext.Window({
            title:"Hadoop Cluster",
            width:480,
            height:360,
            autoScroll: true,
            bodyStyle:"background-color:white",
            modal:true,
            items:[hadoopClusterGrid]
        });
        carteInfoWindow.show();
    },
    databaseConn:function(){
        var grid=new DatabaseConnGrid();
        grid.getColumnModel().setHidden(1,true);
        var databaseConnW=new Ext.Window({
            title:"连接管理",
            width:750,
            modal:true,
            items:[grid]
        });
        databaseConnW.show();
    },

	/*
	 *
	 * end toolbar func
	 *
	 * */


    clusterSchema: function() {
        var dialog = new ClusterSchemaDialog();
        dialog.show();
    },

    partitionSchema: function() {
        var dialog = new PartitionSchemaDialog();
        dialog.show();
    },

    initContextMenu: function(menu, cell, evt) {
        var graph = this.getGraph(), me = this;
        if(this.Executable==false && this.readOnly==false){
            if(cell == null) {
                menu.addItem('新建注释', null, function(evt) {
                    me.createNote(evt);
                }, null, null, true);
                menu.addItem('从剪贴板粘贴步骤', null, function(){alert(1);}, null, null, true);
                menu.addSeparator(null);
                menu.addItem('全选', null, function(){me.getGraph().selectVertices();}, null, null, true);
                menu.addItem('清除选择', null, function(){me.getGraph().clearSelection();}, null, null, true);
                menu.addSeparator(null);
                menu.addItem('查看图形文件', null, function(){
                    var dialog = new TextAreaDialog();
                    dialog.show(null, function() {
                        dialog.initData(me.toXml());
                    });
                }, null, null, true);
                menu.addItem('查看引擎文件', null, function(){
                    Ext.Ajax.request({
                        url: GetUrl('trans/engineXml.do'),
                        params: {graphXml: me.toXml()},
                        method: 'POST',
                        success: function(response) {
                            var dialog = new TextAreaDialog();
                            dialog.show(null, function() {
                                dialog.initData(response.responseText);
                            });
                        }
                    });
                }, null, null, true);
                menu.addSeparator(null);
                menu.addItem('转换设置', null, function() {
                    var transDialog = new TransDialog();
                    transDialog.show();
                }, null, null, true);
            } else if(cell.isVertex()) {
                if(cell.value.nodeName == 'NotePad') {
                    menu.addItem('编辑注释', null, function() {alert(1);}, null, null, true);
                    menu.addItem('删除注释', null, function(){alert(1);}, null, null, true);
                } else {
                    menu.addItem('编辑步骤', null, function() {me.editCell(cell);}, null, null, true);
                    menu.addItem('编辑步骤描述', null, function(){alert(1);}, null, null, true);
                    menu.addSeparator(null);
                    var sendMethod = menu.addItem('数据发送......', null, null, null, null, true);

                    var text = 'Round-Robin', text1 = '复制发送模式';
                    if(cell.getAttribute('distribute') == 'Y')
                        text = '[√]Round-Robin';
                    else
                        text1 = '[√]复制发送模式';

                    menu.addItem(text, null, function() {
                        graph.getModel().beginUpdate();
                        try
                        {
                            var edit = new mxCellAttributeChange(cell, 'distribute', 'Y');
                            graph.getModel().execute(edit);
                        } finally
                        {
                            graph.getModel().endUpdate();
                        }
                        me.setDistribute(cell);
                    }, sendMethod, null, true);
                    menu.addItem(text1, null, function() {
                        graph.getModel().beginUpdate();
                        try
                        {
                            var edit = new mxCellAttributeChange(cell, 'distribute', 'N');
                            graph.getModel().execute(edit);
                        } finally
                        {
                            graph.getModel().endUpdate();
                        }
                        me.setDistribute(cell);
                    }, sendMethod, null, true);

                    menu.addItem('改变开始复制的数量...', null, this.changeCopies.createDelegate(this, [cell]), null, null, true);
                    menu.addSeparator(null);
                    menu.addItem('复制到剪贴板', null, function(){
                        mxClipboard.copy(graph);
                    }, null, null, true);
                    menu.addItem('复制步骤', null, function(){
                        mxClipboard.copy(graph);
                        mxClipboard.paste(graph);
                    }, null, null, true);
                    menu.addItem('删除步骤', null, function(){
                        graph.removeCells();
                    }, null, null, true);
                    menu.addItem('隐藏步骤', null, function(){alert(1);}, null, null, false);
                    menu.addItem('分离步骤', null, function(){alert(1);}, null, null, true);
                    menu.addSeparator(null);
                    menu.addItem('显示输入字段', null, function(){
                        var stepFieldsDialog = new StepFieldsDialog({before: true});
                        stepFieldsDialog.show();
                    }, null, null, true);
                    menu.addItem('显示输出字段', null, function(){
                        var stepFieldsDialog = new StepFieldsDialog({before: false});
                        stepFieldsDialog.show();
                    }, null, null, true);
                    menu.addSeparator(null);

                    menu.addItem('定义错误处理', null, function(){
                        var dialog = new StepErrorMetaDialog();
                        dialog.on('ok', function(data) {
                            graph.getModel().beginUpdate();
                            try
                            {
                                var edit = new mxCellAttributeChange(cell, 'error', Ext.encode(data));
                                graph.getModel().execute(edit);
                            } finally
                            {
                                graph.getModel().endUpdate();
                            }
                            me.showError(cell);
                            dialog.close();
                        });
                        dialog.show();
                    }, null, null, cell.getAttribute('supports_error_handing') == 'Y');

                    menu.addItem('预览', null, function(){

                        var selectedCells = [];
                        Ext.each(graph.getSelectionCells(), function(c) {
                            if(c.isVertex() && c.value)
                                selectedCells.push(c.getAttribute('label'));
                        });

                        Ext.Ajax.request({
                            url: GetUrl('trans/initPreview.do'),
                            params: {graphXml: me.toXml(), selectedCells: encodeURIComponent(Ext.encode(selectedCells))},
                            method: 'POST',
                            success: function(response) {
                                var jsonArray = Ext.decode(response.responseText);
                                var win = new TransDebugDialog();
                                win.show(null, function() {
                                    win.initData(jsonArray);
                                });
                            },
                            failure: failureResponse
                        });


                    }, null, null, true);

                    menu.addSeparator(null);
                    menu.addItem('分区', null, function(){
                        var dialog = new SelectPartitionDialog();
                        dialog.on('ok', function(data) {
                            graph.getModel().beginUpdate();
                            try
                            {
                                var edit = new mxCellAttributeChange(cell, 'partitioning', Ext.encode(data));
                                graph.getModel().execute(edit);
                            } finally
                            {
                                graph.getModel().endUpdate();
                            }

                            me.showPartitioning(cell);
                        });
                        dialog.show(null, function() {
                            dialog.initData(Ext.decode(cell.getAttribute('partitioning')));
                        });
                    }, null, null, this.getPartitionSchemaStore().getCount() > 0);

                    menu.addItem('集群', null, function(){
                        var availableClusters =  new ListView({
                            valueField: 'name',
                            store: me.getClusterSchemaStore(),
                            columns: [{
                                width: 1, dataIndex: 'name'
                            }]
                        });

                        var win = new Ext.Window({
                            width: 200,
                            height: 300,
                            title: '集群选择',
                            layout: 'fit',
                            modal: true,
                            items: availableClusters,
                            bbar: ['->', {
                                text: '确定', handler: function() {
                                    if(!Ext.isEmpty(availableClusters.getValue())) {
                                        graph.getModel().beginUpdate();
                                        try
                                        {
                                            var edit = new mxCellAttributeChange(cell, 'cluster_schema', availableClusters.getValue());
                                            graph.getModel().execute(edit);
                                        } finally
                                        {
                                            graph.getModel().endUpdate();
                                        }

                                        me.showCluster(cell);
                                        win.close();
                                    }
                                }
                            }]
                        });

                        win.show();
                    }, null, null, true);
                }
            } else if(cell.isEdge()) {
                menu.addItem('编辑连接', null, function(){alert(1);}, null, null, true);
                menu.addItem('使节点连接失效', null, function(){ }, null, null, true);
                menu.addItem('删除节点连接', null, function(){
                    graph.removeCells();
                }, null, null, true);
                menu.addItem('翻转方向', null, function(){ }, null, null, true);
            }
        }
    },

    onClusterSchemaMerge: function(json) {
        var graph = this.getGraph();
        var root = graph.getDefaultParent();
        var clusterSchemas = root.getAttribute('clusterSchemas');
        var jsonArray = Ext.decode(clusterSchemas);

        if(jsonArray.length == 0) {
            jsonArray.push(json);
        } else {
            Ext.each(jsonArray, function(item, index) {
                if(item.name == json.name) {
                    jsonArray.splice(index, 1, json);
                } else {
                    if(index == jsonArray.length - 1)
                        jsonArray.push(json);
                }
            });
        }

        graph.getModel().beginUpdate();
        try
        {
            var edit = new mxCellAttributeChange(root, 'clusterSchemas', Ext.encode(jsonArray));
            graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
    },

    onClusterSchemaDel: function(name) {
        var graph = this.getGraph();
        var root = graph.getDefaultParent();
        var clusterSchemas = root.getAttribute('clusterSchemas');
        var jsonArray = Ext.decode(clusterSchemas);

        Ext.each(jsonArray, function(item, index) {
            if(item.name == name) {
                jsonArray.splice(index, 1);
                return false;
            }
        });

        graph.getModel().beginUpdate();
        try
        {
            var edit = new mxCellAttributeChange(root, 'clusterSchemas', Ext.encode(jsonArray));
            graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
    },

    getClusterSchemaStore: function() {
        if(!this.clusterSchemaStore) {
            this.clusterSchemaStore = new Ext.data.JsonStore({
                idProperty: 'name',
                fields: ['name', 'base_port', 'sockets_buffer_size', 'sockets_flush_interval', 'sockets_compressed', 'dynamic', 'slaveservers']
            });
        }
        var graph = this.getGraph();
        var cell = graph.getDefaultParent(), data = [];
        if(cell.getAttribute('clusterSchemas') != null)
            data = Ext.decode(cell.getAttribute('clusterSchemas'));
        this.clusterSchemaStore.loadData(data);

        return this.clusterSchemaStore;
    },

    onPartitionSchemaMerge: function(json) {
        var graph = this.getGraph();
        var root = graph.getDefaultParent();
        var partitionSchemas = root.getAttribute('partitionSchemas');
        var jsonArray = Ext.decode(partitionSchemas);

        if(jsonArray.length == 0) {
            jsonArray.push(json);
        } else {
            Ext.each(jsonArray, function(item, index) {
                if(item.name == json.name) {
                    jsonArray.splice(index, 1, json);
                } else {
                    if(index == jsonArray.length - 1)
                        jsonArray.push(json);
                }
            });
        }

        graph.getModel().beginUpdate();
        try
        {
            var edit = new mxCellAttributeChange(root, 'partitionSchemas', Ext.encode(jsonArray));
            graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
    },

    getPartitionSchemaStore: function() {
        if(!this.partitionSchemaStore) {
            this.partitionSchemaStore = new Ext.data.JsonStore({
                idProperty: 'name',
                fields: ['name', 'dynamic', 'partitions_per_slave', 'partition']
            });
        }
        var graph = this.getGraph();
        var cell = graph.getDefaultParent(), data = [];
        if(cell.getAttribute('partitionSchemas') != null)
            data = Ext.decode(cell.getAttribute('partitionSchemas'));

        this.partitionSchemaStore.loadData(data);

        return this.partitionSchemaStore;
    },

//	cellAdded: function(graph, child) {
//		this.showPartitioning(child);
//
//		if(child.getAttribute('cluster_schema')) {
//			this.showCluster(child);
//		}
//	},

    changeCopies: function(cell) {
        var graph = this.getGraph();

        Ext.MessageBox.prompt('步骤复制的数量...', '复制的数量（1或更多）：', function(btn, text) {
            if(btn == 'ok' && text != '') {
                var num = parseInt(text);
                if(num > 0) {
                    graph.getModel().beginUpdate();
                    try {
                        var edit = new mxCellAttributeChange(cell, 'copies', num);
                        graph.getModel().execute(edit);
                        this.showPartitioning(cell);
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }
            }
        }, this);
    },

    newStep: function(node, x, y, w, h) {
        var graph = this.getGraph();
        Ext.Ajax.request({
            url: GetUrl('trans/newStep.do'),
            params: {graphXml: this.toXml(), pluginId: node.attributes.pluginId, name: node.text},
            method: 'POST',
            success: function(response) {
                var doc = response.responseXML;
                graph.getModel().beginUpdate();
                try
                {
                    var cell = graph.insertVertex(graph.getDefaultParent(), null, doc.documentElement, x, y, w, h, "icon;image=" + node.attributes.dragIcon);
                    graph.setSelectionCells([cell]);
                } finally
                {
                    graph.getModel().endUpdate();
                }
                graph.container.focus();
            }
        });
    },

    newHop: function(edge) {
        var graph = this.getGraph(), found = false;
        var sourceCell = graph.getModel().getCell( edge.source.getId() );
        Ext.each(graph.getOutgoingEdges(sourceCell), function(outgoingEdge) {
            if(outgoingEdge.target.getId() == edge.target.getId() && outgoingEdge.getId() != edge.getId()) {
                found = true;
                return false;
            }
        });

        if(found === true) {
            graph.removeCells([edge]);
            return;
        }

        var doc = mxUtils.createXmlDocument();
        var hop = doc.createElement('TransHop');

        hop.setAttribute('from', edge.source.getAttribute('label'));
        hop.setAttribute('to', edge.target.getAttribute('label'));
        hop.setAttribute('enable', 'Y');
        edge.setValue(hop);

    },

    showError: function(cell) {
        var error = cell.getAttribute('error');
        error = error ? Ext.decode(error) : {};

        var graph = this.getGraph();
        Ext.each(graph.getOutgoingEdges(cell), function(edge) {
            graph.getModel().beginUpdate();
            try
            {
                if(error.is_enabled == 'Y' && error.target_step == edge.target.getAttribute('label')) {
                    var edit = new mxCellAttributeChange(edge, 'label', kettle.imageFalse);
                    graph.getModel().execute(edit);
                    edge.setStyle('error');
                } else {
                    var edit = new mxCellAttributeChange(edge, 'label', null);
                    graph.getModel().execute(edit);
                    edge.setStyle(null);
                }
            } finally
            {
                graph.getModel().endUpdate();
            }

        });
    },

    setDistribute: function(cell) {
        var error = cell.getAttribute('error');
        error = error ? Ext.decode(error) : {};

        var graph = this.getGraph();
        Ext.each(graph.getOutgoingEdges(cell), function(edge) {
            if(!(error.is_enabled == 'Y' && error.target_step == edge.target.getAttribute('label'))) {
                graph.getModel().beginUpdate();
                try
                {
                    if(cell.getAttribute('distribute') == 'N') {
                        var edit = new mxCellAttributeChange(edge, 'label', kettle.imageCopyHop);
                        graph.getModel().execute(edit);
                    } else {
                        var edit = new mxCellAttributeChange(edge, 'label', null);
                        graph.getModel().execute(edit);
                    }
                } finally
                {
                    graph.getModel().endUpdate();
                }
            }
        }, this);
    },

    showPartitioning: function(cell) {
        var graph = this.getGraph();
        var overlays = graph.getCellOverlays(cell) || [];
        for(var i=0; i<overlays.length; i++) {
            var overlay = overlays[i];

            if(overlay.align == mxConstants.ALIGN_LEFT && overlay.verticalAlign == mxConstants.ALIGN_TOP) {
                graph.removeCellOverlay(cell, overlay);
            }
        }

        var partitioning = Ext.decode(cell.getAttribute('partitioning'));
        if(partitioning.method != 'none') {
            this.getPartitionSchemaStore().each(function(rec) {
                if(rec.get('name') == partitioning.schema_name) {
                    var copies = rec.get('partition').length;
                    var text = (rec.get('dynamic') == 'Y' ? 'D' : 'P') + 'x' + copies;
                    var name = rec.get('name'), url = GetUrl('ui/text2image/partition.do?text=' + text);

                    Ext.Ajax.request({
                        url: GetUrl('ui/text2image/width.do?text=' + text),
                        method: 'GET',
                        success: function(response) {
                            var w = parseInt(response.responseText);

                            var offset = new mxPoint(0, -16);
                            var overlay = new mxCellOverlay(new mxImage(url, w + 4, 12 + 4), name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, offset);
                            graph.addCellOverlay(cell, overlay);
                        }
                    });
                }
            });
        } else {
            this.showCopies(cell);
        }
    },

    showCopies: function(cell) {
        var graph = this.getGraph();
        var overlays = graph.getCellOverlays(cell) || [];
        for(var i=0; i<overlays.length; i++) {
            var overlay = overlays[i];

            if(overlay.align == mxConstants.ALIGN_LEFT && overlay.verticalAlign == mxConstants.ALIGN_TOP) {
                graph.removeCellOverlay(cell, overlay);
            }
        }
        var copies = parseInt(cell.getAttribute('copies'));
        if(copies > 1) {
            Ext.Ajax.request({
                url: 'ui/text2image/width.do?text=X' + cell.getAttribute('copies'),
                method: 'GET',
                success: function(response) {
                    var w = parseInt(response.responseText);

                    var offset = new mxPoint(0, -10);
                    var overlay = new mxCellOverlay(new mxImage('ui/text2image.do?text=X' + cell.getAttribute('copies'), w, 12), 'update: ', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, offset);
                    graph.addCellOverlay(cell, overlay);
                }
            });
        }
    },

    showCluster: function(cell) {
        var graph = this.getGraph();
        var overlays = graph.getCellOverlays(cell) || [];
        for(var i=0; i<overlays.length; i++) {
            var overlay = overlays[i];

            if(overlay.align == mxConstants.ALIGN_RIGHT && overlay.verticalAlign == mxConstants.ALIGN_TOP) {
                graph.removeCellOverlay(cell, overlay);
            }
        }
        var cluster_schema = cell.getAttribute('cluster_schema');
        if(cluster_schema) {
            Ext.Ajax.request({
                url: 'ui/text2image/width.do?text=' + cluster_schema,
                method: 'GET',
                success: function(response) {
                    var w = parseInt(response.responseText);

                    var offset = new mxPoint(0, -10);
                    var overlay = new mxCellOverlay(new mxImage('ui/text2image.do?text=' + cluster_schema, w, 12), 'update: ', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, offset);
                    graph.addCellOverlay(cell, overlay);
                }
            });
        }
    },

    inputFields: function(stepName) {
        var graph = this.getGraph();
        var store = new Ext.data.JsonStore({
            fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
            proxy: new Ext.data.HttpProxy({
                url: GetUrl('trans/inputOutputFields.do'),
                method: 'POST'
            })
        });

        store.on('loadexception', function(misc, s, response) {
            failureResponse(response);
        });


        store.baseParams.stepName = encodeURIComponent(stepName);
        store.baseParams.graphXml = this.toXml();
        store.baseParams.before = true;

        return store;
    },

    outputFields: function(stepName) {
        var graph = this.getGraph();
        var store = new Ext.data.JsonStore({
            fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
            proxy: new Ext.data.HttpProxy({
                url: GetUrl('trans/inputOutputFields.do'),
                method: 'POST'
            })
        });

        store.on('loadexception', function(misc, s, response) {
            failureResponse(response);
        });


        store.baseParams.stepName = encodeURIComponent(stepName);
        store.baseParams.graphXml = this.toXml();
        store.baseParams.before = false;

        return store;
    },

    inputOutputFields: function(stepName, before, cb) {
        var graph = this.getGraph();
        var store = new Ext.data.JsonStore({
            fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
            proxy: new Ext.data.HttpProxy({
                url: GetUrl('trans/inputOutputFields.do'),
                method: 'POST'
            })
        });

        store.on('loadexception', function(misc, s, response) {
            failureResponse(response);
        });

        store.on('load', function() {
            if(Ext.isFunction(cb))
                cb(store);
        });

        store.baseParams.stepName = encodeURIComponent(stepName);
        store.baseParams.graphXml = this.toXml();
        store.baseParams.before = before;
        store.load();

        return store;
    },

    nextSteps: function(stepName, cb) {
        var graph = this.getGraph();
        var store = new Ext.data.JsonStore({
            fields: ['name'],
            proxy: new Ext.data.HttpProxy({
                url: GetUrl('trans/nextSteps.do'),
                method: 'POST'
            })
        });

        store.on('loadexception', function(misc, s, response) {
            failureResponse(response);
        });

        store.on('load', function() {
            if(Ext.isFunction(cb))
                cb(store);
        });

        store.baseParams.stepName = encodeURIComponent(stepName);
        store.baseParams.graphXml = this.toXml();

        return store;
    },

    previousSteps: function(stepName, cb) {
        var graph = this.getGraph();
        var store = new Ext.data.JsonStore({
            fields: ['name'],
            proxy: new Ext.data.HttpProxy({
                url: GetUrl('trans/previousSteps.do'),
                method: 'POST'
            })
        });

        store.on('loadexception', function(misc, s, response) {
            failureResponse(response);
        });

        store.on('load', function() {
            if(Ext.isFunction(cb))
                cb(store);
        });

        store.baseParams.stepName = encodeURIComponent(stepName);
        store.baseParams.graphXml = this.toXml();

        return store;
    },

    updateStatus: function(status) {
        var graph = this.getGraph();

        for(var i=0; i<status.length; i++) {
            var cells = graph.getModel().getChildCells(graph.getDefaultParent(), true, false);
            for(var j=0; j<cells.length; j++) {
                var cell = cells[j];
                if(cell.getAttribute('label') == status[i].stepName) {
                    var overlays = graph.getCellOverlays(cell) || [];
                    for(var k=0; k<overlays.length; k++) {
                        var overlay = overlays[k];

                        if(overlay.align == mxConstants.ALIGN_RIGHT && overlay.verticalAlign == mxConstants.ALIGN_TOP
                            && overlay.offset.x == 0 && overlay.offset.y == 0) {
                            graph.removeCellOverlay(cell, overlay);
                        }
                    }

                    if(status[i].stepStatus > 0) {
                        var overlay = new mxCellOverlay(new mxImage('ui/images/false.png', 16, 16), status[i].logText, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
                        graph.addCellOverlay(cell, overlay);
                    } else {
                        var overlay = new mxCellOverlay(new mxImage('ui/images/true.png', 16, 16), null, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
                        graph.addCellOverlay(cell, overlay);
                    }
                    break;
                }
            }
        }
    }
});

Ext.reg('TransGraph', TransGraph);
