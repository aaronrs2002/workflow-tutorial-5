import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import TicketList from "./TicketList";



const TicketBuilder = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);

    let [confirm, setConfirm] = useState("");


    const populateFields = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);
            return false;
        }
        props.setActiveTicket((activeTicket) => whichTicket);

        axios.get("api/tickets/grab-ticket/" + whichTicket, props.config).then(
            (res) => {


                document.querySelector("[name='ticketTitle']").value = res.data[0].ticketId;
                document.querySelector("[name='ticketInfo']").value = res.data[0].ticketInfo;
                props.getMessages(whichTicket);

            }, (error) => {
                props.showAlert("That didn't work", "danger");
            }
        )
    }

    const addTicket = () => {
        Validate(["ticketTitle", "ticketInfo"]);

        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {
            let tkObj = {
                ticketId: timestamp() + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value,
                ticketInfo: document.querySelector("[name='ticketInfo']").value
            }
            axios.post("/api/tickets/add-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " added.", "success");
                        props.getTickets(props.userEmail);
                        document.querySelector("[name='ticketTitle']").value = "";
                        document.querySelector("[name='ticketInfo']").value = "";
                    } else {
                        props.showAlert("Something went wrong", "danger");
                    }



                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }

    }

    const editTicket = () => {
        Validate(["ticketTitle", "ticketInfo"]);
        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {
            let tkObj = {
                ticketId: props.activeTicket,
                ticketInfo: document.querySelector("[name='ticketInfo']").value
            }
            axios.put("/api/tickets/update-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " updated.", "success");
                        props.getTickets(props.userEmail);
                        document.querySelector("[name='ticketTitle']").value = "";
                        document.querySelector("[name='ticketInfo']").value = "";
                        document.querySelector("[name='ticketList']").selectedIndex = 0;
                    } else {
                        props.showAlert("Something went wrong", "danger");
                    }


                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }


    }


    const deleteTicket = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            return false;
        }
        axios.delete("/api/tickets/delete-ticket/" + whichTicket, props.config).then(

            (res) => {
                if (res.data.affectedRows > 0) {
                    props.showAlert("Success in deleting.", "info");
                    props.getTickets(props.userEmail);
                    document.querySelector("[name='ticketList']").selectedIndex = 0;
                    setConfirm((confirm) => "");
                } else {
                    props.showAlert("That did not work.", "danger");
                }

            }, (error) => {
                props.showAlert("Something didn't work.", "danger");
            }

        )


    }

    const resetFunction = (whatFunc) => {
        setFunc((func) => whatFunc);
        if (document.querySelector("[name='ticketTitle']") && document.querySelector("[name='ticketInfo']")) {
            document.querySelector("[name='ticketTitle']").value = "";
            document.querySelector("[name='ticketInfo']").value = "";
        }

    }
    useEffect(() => {
        if (loaded === false) {
            props.getTickets(props.userEmail);
            setLoaded((loaded) => true);
        }
    }, []);

    return (<div className="row">
        {props.ticketInfo !== null ?
            <div className="col-md-12">
                <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
            </div> : null
        }
        <div className="col-md-12">
            <div className="btn-group block">
                <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("add")}>New Ticket</button>
                <button className={func === "edit" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("edit")}>Edit Ticket</button>
                <button className={func === "delete" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("delete")}>Delete Ticket</button>
            </div>
        </div>


        {func !== "delete" ?

            <div className="col-md-12">
                <input type="text" className="form-control" name="ticketTitle" placeholder="Ticket title" />
                <textarea className="form-control" rows="5" name="ticketInfo" placeholder="Ticket info"></textarea>
                {func === "add" ?
                    <button className="btn btn-primary btn-block" onClick={() => addTicket()}>Add ticket</button>
                    :
                    <button className="btn btn-primary  btn-block" onClick={() => editTicket()}>Edit ticket</button>}
            </div>

            :




            <div className="col-md-12">


                {confirm === "deleteTicket" ?
                    <div role="alert" className="alert alert-danger">
                        <p>Are you sure you want to delete this ticket?</p>
                        <button className="btn btn-warning" onClick={() => deleteTicket()}>Yes</button>
                        <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                    </div> :
                    <button className="btn btn-danger btn-block" onClick={() => setConfirm((confirm) => "deleteTicket")}>Delete ticket</button>}
            </div>




        }
    </div>)
}

export default TicketBuilder;
