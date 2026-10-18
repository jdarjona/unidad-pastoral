using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UnidadPastoral.Api.Dtos;
using UnidadPastoral.Api.Services;

namespace UnidadPastoral.Api.Controllers;

[ApiController]
[Route("api/pastorale")]
public sealed class PastoraleActivitiesController(IPastoraleActivityService activities) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PastoraleActivityResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PastoraleActivityResponse>>> List(CancellationToken cancellationToken)
    {
        return Ok(await activities.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PastoraleActivityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PastoraleActivityResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var activity = await activities.GetByIdAsync(id, cancellationToken);
        return activity is null ? NotFound() : Ok(activity);
    }

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(PastoraleActivityResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PastoraleActivityResponse>> Create(
        CreatePastoraleActivityRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var activity = await activities.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = activity.Id }, activity);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PastoraleActivityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PastoraleActivityResponse>> Update(
        int id,
        UpdatePastoraleActivityRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var activity = await activities.UpdateAsync(id, request, cancellationToken);
            return activity is null ? NotFound() : Ok(activity);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        return await activities.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
    }
}