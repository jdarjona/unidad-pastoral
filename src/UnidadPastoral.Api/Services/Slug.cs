using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace UnidadPastoral.Api.Services;

public static class Slug
{
    public static string From(string text)
    {
        var normalized = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            builder.Append(char.IsLetterOrDigit(c) ? c : '-');
        }

        return Regex.Replace(builder.ToString(), "-+", "-").Trim('-');
    }
}
