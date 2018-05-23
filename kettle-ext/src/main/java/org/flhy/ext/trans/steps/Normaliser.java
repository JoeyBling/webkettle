package org.flhy.ext.trans.steps;

/**
 * Created by cRAZY on 2017/6/12.
 *   行转列
 */

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.normaliser.NormaliserMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import java.util.List;

@Component("Normaliser")
@Scope("prototype")
public class Normaliser extends AbstractStep{

    @Override
    public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
        NormaliserMeta denor=(NormaliserMeta)stepMetaInterface;
        denor.setTypeField(cell.getAttribute("typefield"));
        String fields=cell.getAttribute("fields");
        JSONArray fieldsJSONArray=JSONArray.fromObject(fields);
        if(fieldsJSONArray.size()>0){
            NormaliserMeta.NormaliserField[] normalisers=new  NormaliserMeta.NormaliserField[fieldsJSONArray.size()];
            for(int j=0;j<fieldsJSONArray.size();j++){
                JSONObject jsonOBJ=fieldsJSONArray.getJSONObject(j);
                NormaliserMeta.NormaliserField nor=new  NormaliserMeta.NormaliserField();
                nor.setName(jsonOBJ.optString("name"));
                nor.setValue(jsonOBJ.optString("value"));
                nor.setNorm(jsonOBJ.optString("norm"));
                normalisers[j]=nor;
            }
            denor.setNormaliserFields(normalisers);
        }
    }

    @Override
    public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
        NormaliserMeta denor=(NormaliserMeta)stepMetaInterface;
        Document doc = mxUtils.createDocument();
        Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
        e.setAttribute("typefield",denor.getTypeField());
        JSONArray jsonArray2=new JSONArray();
        for(int i=0;i<denor.getNormaliserFields().length;i++){
            NormaliserMeta.NormaliserField normaliser=denor.getNormaliserFields()[i];
            JSONObject json=new JSONObject();
            json.put("name",normaliser.getName());
            json.put("value",normaliser.getValue());
            json.put("norm",normaliser.getNorm());
            jsonArray2.add(json);
        }
        e.setAttribute("fields",jsonArray2.toString());
        return e;
    }
}
