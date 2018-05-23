package org.sxdata.jingwei.bean;

import java.util.List;

/**
 * Created by cRAZY on 2017/2/20.
 */
public class PageforBean {
    private int totalProperty;//分页的总记录条数
    private List root;//对象集合,表示本次的查询结果

    public int getTotalProperty() {
        return totalProperty;
    }

    public List getRoot() {
        return root;
    }

    public void setTotalProperty(int totalProperty) {
        this.totalProperty = totalProperty;
    }

    public void setRoot(List root) {
        this.root = root;
    }
}
