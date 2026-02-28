import io
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .utils.exporter import generate_pdf, commit_to_github

@csrf_exempt
def export_pdf_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        pdf_bytes = generate_pdf(data)
        
        mode = data.get('mode', 'session')
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="nexor-{mode}-export.pdf"'
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def export_github_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        github_pat = data.get('githubPat', '')
        repo_name = data.get('githubRepo', '')
        
        if not github_pat or not repo_name:
            return JsonResponse({'error': 'githubPat and githubRepo are required'}, status=400)
            
        result = commit_to_github(data, github_pat, repo_name)
        if 'error' in result:
            return JsonResponse(result, status=500)
            
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
