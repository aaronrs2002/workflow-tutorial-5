import React, { useEffect, useState } from "react";
import Validate from "./Validate";
import axios from "axios";
import TicketList from "./TicketList";

const WorkFlow = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);
    let [stepsData, setStepsData] = useState([]);
    //[{ stepTitle: "title one", stepPrice: "3 days", tasks: ["gather info:not-complete", "list goals:complete"] }]
    let [confirm, setConfirm] = useState("");
    let [onDeckDelete, setOnDeckDelete] = useState("");
    let [activeStep, setActiveStep] = useState(null);
    let [activeTaskList, setActiveTaskList] = useState("add/delete tasks");
    let [ticketSelected, setTicketSelected] = useState("default");
    let [existingData, setExistingData] = useState(false);


    const populateFields = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        setTicketSelected((ticketSelected) => whichTicket);
        if (whichTicket === "default") {
            props.showAlert("Wich ticket?", "warning");
            props.setActiveTicket((activeTicket) => null);
            return false;
        }

        props.setActiveTicket((activeTicket) => whichTicket);


        //CLIENT SIDE GET INFO BASED ON A SPECIFIC TICKET
        axios.get("/api/workflow/get-workflow/" + whichTicket, props.config).then(
            (res) => {
                if (res.data.length === 0 || res.data[0].stepsData === null) {
                    props.showAlert("No data yet.", "info");
                    setStepsData((stepsData) => []);
                    setExistingData((existingData) => false);
                    return false;
                } else {
                    let dataSuccess = JSON.parse(res.data[0].stepsData);
                    setExistingData((existingData) => true);
                    setStepsData((stepsData) => dataSuccess);
                    props.getMessages(whichTicket);
                }
            }
        );

        setFunc((func) => "add");

    }


    const updateStep = (newStep) => {
        let tempTitle;
        let tempPrice;
        let whichTicket = document.querySelector("[name='ticketList']").value;
        setTicketSelected((ticketSelected) => whichTicket);
        if (whichTicket === "default") {
            props.showAlert("Select an event", "warning");
            return false;
        }
        let tempStepData = stepsData;
        if (newStep === false) {
            try {
                if (document.querySelector("[name='stepTitle']").value !== "") {
                    tempStepData[activeStep].stepTitle = document.querySelector("[name='stepTitle']").value;

                }
            } catch (error) {
                console.log("no title to update");
            }
        } else {
            let tempActiveTaskList = ["add/delete tasks"];
            if (func === "add") {
                Validate(["newStepTitle", "newStepPrice"]);
                tempTitle = document.querySelector("[name='newStepTitle']").value;
                tempPrice = document.querySelector("[name='newStepPrice']").value;

            } else {
                tempActiveTaskList = activeTaskList;
            }
            if (document.querySelector(".error")) {
                props.showAlert("Fill out fields", "warning");
                return false;
            } else {
                if (activeTaskList === null) {
                    tempActiveTaskList = [];
                }

                if (func === "add") {
                    tempStepData = [...tempStepData, { stepTitle: tempTitle, stepPrice: tempPrice, tasks: tempActiveTaskList }]
                }
            }

        }
        let tempObj = [];
        if (func === "delete") {
            tempTitle = tempStepData[activeStep].stepTitle;
            tempPrice = tempStepData[activeStep].stepPrice;
            for (let i = 0; i < tempStepData.length; i++) {
                if (i !== parseInt(activeStep)) {
                    tempObj.push(tempStepData[i]);
                }
            }
            tempStepData = tempObj;

        } else {
            if (document.querySelector("[name='stepPrice']") && document.querySelector("[name='stepPrice']").value !== "") {
                tempStepData[activeStep].stepPrice = document.querySelector("[name='stepPrice']").value;
            }
        }



        axios.put("/api/workflow/update-workflow/", { ticketId: document.querySelector("[name='ticketList']").value, stepsData: JSON.stringify(tempStepData) }, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("IUpdate failed.", "warning");
                } else {
                    setActiveStep((activeStep) => []);
                    populateFields();
                    if (document.querySelector("[newStepTitle]")) {
                        document.querySelector("[newStepTitle]").value = "";
                        document.querySelector("[newStepPrice]").value = "";
                    }
                }
            }, (error) => {
                console.log(error);
                props.showAlert("Your submission did not go through.", "danger");
            }
        );
    }


    const postStep = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        setTicketSelected((ticketSelected) => whichTicket);
        if (whichTicket === "default") {
            props.showAlert("Wich ticket?", "warning");
            return false;
        }

        let tempSteps = [...stepsData, { stepTitle: document.querySelector("[name='newStepTitle']").value, stepPrice: document.querySelector("[name='newStepPrice']").value, tasks: [] }];

        axios.post("/api/workflow/add-workflow/", { ticketId: whichTicket, stepsData: JSON.stringify(tempSteps) }, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("Message: " + res.data.message, "warning");

                } else {
                    setStepsData((stepsData) => tempSteps);
                    props.showAlert(document.querySelector("[name='newStepTitle']").value + " added.", "success");
                    document.querySelector("[name='newStepTitle']").value = "";
                    document.querySelector("[name='newStepPrice']").value = "";
                }
            }, (error) => {
                props.showAlert("Your submission did not go through: " + error, "danger");
            }
        );
    }





    const createStep = () => {
        Validate(["newStepTitle", "newStepPrice"]);

        if (document.querySelector(".error")) {
            props.showAlert("Your step needs a name and a price/time.", "warning");
            return false;
        } else {
            if (existingData === false) {
                postStep();
                setExistingData((existingData) => true);
            } else {
                updateStep(true);
            }
        }


    }

    const selectForDelete = () => {
        let whichStep = document.querySelector("select[name='selectDelete']").value;
        if (whichStep === "default") {
            return false;
        }
        setOnDeckDelete((onDeckDelete) => stepsData[whichStep].stepTitle);
        setConfirm((confirm) => "deleteStep");

        selectStep(whichStep);

    }

    const deleteStep = () => {
        let tempDelete = [];
        for (let i = 0; i < stepsData.length; i++) {
            if (stepsData[i].stepTitle !== onDeckDelete) {
                tempDelete.push(stepsData[i]);
            }
        }

        setStepsData((stepsData) => tempDelete);
        setConfirm((confirm) => "");
        document.querySelector("[name='selectDelete']").selectedIndex = 0;
        updateStep(true);

    }

    const selectStep = (stepNum) => {
        setActiveStep((activeStep) => stepNum);
        setActiveTaskList((activeTaskList) => stepsData[stepNum].tasks);
    }


    const removeTask = (taskNum) => {
        let tempData = stepsData;
        let tempList = [];
        for (let i = 0; i < activeTaskList.length; i++) {
            if (i !== taskNum) {
                tempList.push(activeTaskList[i]);
            }
        }
        tempData[activeStep].tasks = tempList;
        setStepsData((stepsData) => tempData);
        setActiveTaskList((activeTaskList) => tempList);

    }

    const addTask = () => {

        let tempData = stepsData;
        let tempList = activeTaskList;

        Validate(["addTask"]);

        if (document.querySelector(".error")) {
            props.showAlert("Write a task", "warning");
            return false;
        } else {
            tempList = [...tempList, document.querySelector("[name='addTask']").value + ":not-complete"];
            setActiveTaskList((activeTaskList) => tempList);
            tempData[activeStep].tasks = tempList;
            document.querySelector("[name='addTask']").value = "";

        }
    }


    const updateStatus = (task) => {
        let tempActiveTaskList = activeTaskList;
        const status = document.querySelector("[name='taskStatus-" + task + "']").value;
        if (status === "default") {
            return false;
        }

        if (tempActiveTaskList[task].indexOf(":") !== -1) {

            tempActiveTaskList[task] = tempActiveTaskList[task].substring(0, tempActiveTaskList[task].indexOf(":"));

            switch (status) {
                case "waiting":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":waiting";
                    break;
                case "hold":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":hold";
                    break;
                case "in-progress":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":in-progress";
                    break;
                case "review":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":review";
                    break;
                case "complete":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":complete";
                    break;
            }

            setActiveTaskList((activeTaskList) => tempActiveTaskList);
        }
    }


    useEffect(() => {
        if (loaded === false) {
            props.getTickets(props.userEmail);
            setLoaded((loaded) => true);
        }
    }, []);

    return (

        <React.Fragment>
            <div className="row">
                <div className="col-md-12">
                    <TicketList populateFields={populateFields} ticketInfo={props.ticketInfo} />
                </div>

                <div className="col-md-12">
                    <div className="btn-group block">
                        <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setFunc((func) => "add")}>New Step</button>
                        <button className={func === "delete" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setFunc((func) => "delete")}>Delete Step</button>
                    </div>
                </div>



                {func === "add" ?

                    <div className="col-md-12">
                        <input type="text" name="newStepTitle" className="form-control" placeholder="Step Name" />
                        <input type="text" name="newStepPrice" className="form-control" placeholder="Total time or dollar amount" />
                        <button className="btn btn-primary w-100" onClick={() => createStep()}>Submit</button>
                    </div>
                    : <div className="col-md-12">
                        <select className="form-control" onChange={() => selectForDelete()} name="selectDelete">
                            <option value="default">Select step to delete</option>
                            {stepsData ? stepsData.map((step, i) => {
                                return <option key={i} value={i}>{step.stepTitle}</option>
                            }) : null}
                        </select>
                    </div>}

                {confirm === "deleteStep" ?
                    <div className="col-md-12 alert alert-warning">
                        <p>Are you sure you want to delete {onDeckDelete}</p>
                        <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                        <button className="btn btn-warning" onClick={() => deleteStep()}>Yes</button>
                    </div>
                    : null}
            </div>

            <div className="row row-col-1 row-col-md-4 py-5">

                {(typeof stepsData) === "object" ?

                    stepsData.map((step, i) => {

                        return (
                            <div className="col" key={i} data-step={i}>
                                <div className={
                                    step.tasks.toString().indexOf(":hold") === -1 &&
                                        step.tasks.toString().indexOf(":review") === -1 &&
                                        step.tasks.toString().indexOf(":in-progress") === -1 &&
                                        step.tasks.toString().indexOf(":waiting") === -1 &&
                                        step.tasks.toString().indexOf("add/delete tasks") === -1
                                        ? "card mb-4 rounded-3 shadow-sw alert-success" : "card mb-4 rounded-3 shadow-sw alert-secondary"}
                                    id={step.stepTitle.replace(" ", "-") + "-card"}>

                                    <div className="card-header py-3">
                                        {activeStep === i ?
                                            <input type="text" className="form-control" name="stepTitle" placeholder={stepsData[activeStep].stepTitle} /> :
                                            <h4 className="my-0 fw-normal">{step.stepTitle}</h4>}
                                    </div>
                                    <div className="card-body">
                                        {activeStep === i ?
                                            <input type="text" className="form-control" name="stepPrice" placeholder={stepsData[activeStep].stepPrice} /> :
                                            <h5 className="card-title pricing-card-title" >{step.stepPrice}</h5>}

                                        {activeStep !== i ?
                                            <div data-steplist={i} >
                                                <ul className="list-group mt-3 mb-4" data-step={step.stepTitle}>

                                                    {(typeof step.tasks) === "object" && step.tasks.length > 0 ? step.tasks.map((task, j) => {


                                                        let colorCode = "danger";
                                                        if (task.indexOf(":hold") !== -1) {
                                                            colorCode = "warning";
                                                        }
                                                        if (task.indexOf(":in-progress") !== -1) {
                                                            colorCode = "info";
                                                        }
                                                        if (task.indexOf(":review") !== -1) {
                                                            colorCode = "dark";
                                                        }
                                                        if (task.indexOf(":complete") !== -1) {
                                                            colorCode = "success";
                                                        }
                                                        return (<li key={j} className={"list-group-item list-group-item-" + colorCode} data-step={step.stepTitle}
                                                            name={task.substring(0, task.indexOf(":"))} >{task}</li>)

                                                    }) : null}
                                                </ul>
                                            </div>
                                            :

                                            <ul className="list-group">
                                                {(typeof activeTaskList) === "object" ? activeTaskList.map((task, j) => {
                                                    return (<li className="list-group-item list-group-item-secondary" key={j} data-remove={task} >{task} <i className="fas fa-trash pointer"
                                                        key={i} onClick={() => removeTask(j)}></i>

                                                        <select name={"taskStatus-" + j} className="form-control" onChange={() => updateStatus(j)}>
                                                            <option value="default">Select Task Status</option>
                                                            <option value="waiting">Waiting</option>
                                                            <option value="hold">On Hold</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="review">Ready for Review</option>
                                                            <option value="complete">Complete</option>
                                                        </select>

                                                    </li>)
                                                }) : null}
                                                <div className="input-group mb-3">
                                                    <input type="text" className="form-control" name="addTask" placeholder="Add Task" />
                                                    <button className="w-100 btn btn-primary" onClick={() => addTask()}>Add</button>
                                                </div>
                                            </ul>
                                        }
                                    </div>

                                    <div className="card-footer text-muted">
                                        {activeStep === i ?
                                            <button className="btn w-100 btn-lg btn-primary" onClick={() => updateStep(false)}>Update Step</button> :
                                            <button className="btn w-100 btn-lg btn-primary" onClick={() => selectStep(i)}>Edit Step <i className="fas fa-edit"></i></button>}
                                    </div>
                                </div>
                            </div>
                        )
                    })

                    : null}

            </div>

        </React.Fragment >)



}

export default WorkFlow;
