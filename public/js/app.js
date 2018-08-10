$(document).ready(function () {
    
    // save article button
    $(".save-btn").on("click", updateSaved);

    function updateSaved(e) {
        e.preventDefault();
        const card = $(this).parent().parent();
        const id = $(this).data("id");
        const reqdata = ($(this).data("type") === "save") ? { saved: true } : { saved: false };
        $.ajax({
            url: '/articles/' + id,
            type: 'PUT',
            data: reqdata,
            success: function (result) {
                reqdata.saved ? card.remove() : card.parent().remove();
                if ($(".save-btn").length === 0) location.reload();
            }
        });
    }

    // view notes of article: Article by id populated ("notes")
    // GET /articles/:id
    $(".addNote-btn").on("click", function (e) {
        e.preventDefault();
        $("#noteModal").find("tbody").empty();
        const id = $(this).data("id");
        $("#saveNote-btn").data("id", id);
        //
        $.get("/articles/" + id, results => {
            results.notes.forEach((note, i) => makeNote(note, i));
            $("#noteModal").modal('show');
        })
    });

    // save note to article
    //app.post("/notes/:id"
    $("#saveNote-btn").on("click", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const noteData = {
            text: $("#noteText").val()
        }
        $.post("/notes/" + id, noteData, results => {
            const i = $("#noteModal tr").length;
            noteData._id = results.notes[i];
            makeNote(noteData, i);
            $("#noteText").val('');
        });
    });

    // Create note element
    const makeNote = (note, i) => {
        $("#noteModal").find("tbody").append(`<tr>
        <th scope="row">${i + 1}</th>
        <td class="w-75">${note.text}</td>
        <td class="text-right">
            <button class="btn btn-danger delete-note" data-id="${note._id}">
                <i class="far fa-trash-alt"></i>
            </button>
        </td>
    </tr>`);
    }

    // delete note
    // DELETE /notes/:id
    $(document).on("click", ".delete-note", function (e) {
        e.preventDefault();
        const id = $(this).data("id");
        const tr = $(this).parent().parent();
        //
        $.ajax({
            url: '/notes/' + id,
            type: 'DELETE',
            success: function (result) {
                console.log(result);
                tr.remove();
            }
        });
    });


    // scrape new articles
    // GET /scrape
    $(document).on("click", "#scrape-btn", function (e) {
        e.preventDefault();
        $.get("/scrape", results => {
            console.log(results)
            location.reload();
        });
    });

    // clear all 
    // DELETE /articles/clear
    $("#clear-btn").on("click", function (e) {
        e.preventDefault();
        $.ajax({
            url: '/articles/clear',
            type: 'DELETE',
            success: function (result) {
                console.log(result);
                location.reload();
            }
        });
    });

    //
    //
    // end
});